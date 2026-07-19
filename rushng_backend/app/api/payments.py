from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
import uuid

from app.core.database import db
from app.core.dependencies import get_current_user
from app.models.job import Job, JobStatus
from app.models.payment import Payment, PaymentStatus, PaymentProvider
from app.models.user import User
from app.services.payment_service import PaymentService
from app.services.notification_service import NotificationService
from app.core.logging import log_business_event, log_security_event

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/initialize', methods=['POST'])
@jwt_required()
def initialize_payment():
    """Initialize a payment for a job"""
    user = get_current_user()
    data = request.get_json()
    
    job_id = data.get('job_id')
    provider_choice = data.get('provider', 'opay')  # opay, paystack, flutterwave
    
    if not job_id:
        return jsonify({
            'success': False,
            'error': 'Job ID required'
        }), 400
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check ownership
    if str(job.customer_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'You are not authorized to pay for this job'
        }), 403
    
    # Check if job is in correct state
    if job.status not in [JobStatus.ASSIGNED, JobStatus.IN_PROGRESS]:
        return jsonify({
            'success': False,
            'error': f'Payment can only be initialized for assigned or in-progress jobs. Current status: {job.status.value}'
        }), 400
    
    # Check if payment already exists
    existing_payment = Payment.query.filter_by(job_id=job.id).first()
    
    if existing_payment:
        if existing_payment.status in [PaymentStatus.HELD, PaymentStatus.RELEASED]:
            return jsonify({
                'success': False,
                'error': f'Payment already {existing_payment.status.value}'
            }), 400
    
    # Validate provider choice
    try:
        provider = PaymentProvider(provider_choice.lower())
    except ValueError:
        return jsonify({
            'success': False,
            'error': f'Invalid payment provider. Valid: {[p.value for p in PaymentProvider]}'
        }), 400
    
    # Get provider user
    provider_user = User.query.get(job.provider_id)
    
    if not provider_user:
        return jsonify({
            'success': False,
            'error': 'Provider not found for this job'
        }), 404
    
    # Calculate amounts
    amount = job.estimated_price or 0
    platform_fee = amount * 0.10  # 10% commission
    provider_earnings = amount - platform_fee
    
    # Create payment record
    reference = f'RUSHNG-{datetime.utcnow().strftime("%Y%m%d")}-{uuid.uuid4().hex[:8].upper()}'
    
    payment = Payment(
        job_id=job.id,
        customer_id=user.id,
        provider_id=job.provider_id,
        amount=amount,
        platform_fee=platform_fee,
        provider_earnings=provider_earnings,
        provider=provider,
        reference=reference,
        status=PaymentStatus.PENDING
    )
    
    db.session.add(payment)
    db.session.commit()
    
    # Initialize payment with selected provider
    try:
        if provider == PaymentProvider.OPAY:
            result = PaymentService.initialize_opay_payment(payment, user, provider_user)
        elif provider == PaymentProvider.PAYSTACK:
            result = PaymentService.initialize_paystack_payment(payment, user, provider_user)
        elif provider == PaymentProvider.FLUTTERWAVE:
            result = PaymentService.initialize_flutterwave_payment(payment, user, provider_user)
        else:
            return jsonify({
                'success': False,
                'error': 'Unsupported payment provider'
            }), 400
        
        # Hold payment in escrow
        payment.hold()
        db.session.commit()
        
        log_business_event(current_app, 'payment_initialized', {
            'payment_id': str(payment.id),
            'job_id': str(job.id),
            'amount': amount,
            'provider': provider.value
        })
        
        return jsonify({
            'success': True,
            'message': 'Payment initialized successfully',
            'data': {
                'payment_id': str(payment.id),
                'reference': reference,
                'amount': amount,
                'platform_fee': platform_fee,
                'provider_earnings': provider_earnings,
                'status': payment.status.value,
                'authorization_url': result.get('authorization_url'),
                'transaction_ref': result.get('transaction_ref')
            }
        }), 200
        
    except Exception as e:
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = str(e)
        db.session.commit()
        
        current_app.logger.error(f"Payment initialization failed: {e}")
        
        return jsonify({
            'success': False,
            'error': f'Payment initialization failed: {str(e)}'
        }), 500


@payments_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    """Verify a payment"""
    user = get_current_user()
    data = request.get_json()
    
    reference = data.get('reference')
    transaction_ref = data.get('transaction_ref')
    
    if not reference and not transaction_ref:
        return jsonify({
            'success': False,
            'error': 'Reference or transaction_ref required'
        }), 400
    
    # Find payment
    payment = Payment.query.filter(
        (Payment.reference == reference) | (Payment.reference == transaction_ref)
    ).first()
    
    if not payment:
        return jsonify({
            'success': False,
            'error': 'Payment not found'
        }), 404
    
    # Check ownership
    if str(payment.customer_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'You are not authorized to verify this payment'
        }), 403
    
    # Verify with provider
    try:
        if payment.provider == PaymentProvider.OPAY:
            result = PaymentService.verify_opay_payment(payment)
        elif payment.provider == PaymentProvider.PAYSTACK:
            result = PaymentService.verify_paystack_payment(payment)
        elif payment.provider == PaymentProvider.FLUTTERWAVE:
            result = PaymentService.verify_flutterwave_payment(payment)
        else:
            return jsonify({
                'success': False,
                'error': 'Unsupported payment provider'
            }), 400
        
        if result.get('status') == 'success':
            payment.status = PaymentStatus.HELD
            db.session.commit()
            
            log_business_event(current_app, 'payment_verified', {
                'payment_id': str(payment.id),
                'reference': payment.reference
            })
            
            return jsonify({
                'success': True,
                'message': 'Payment verified successfully',
                'data': {
                    'payment_id': str(payment.id),
                    'status': payment.status.value,
                    'amount': payment.amount
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'error': result.get('message', 'Payment verification failed')
            }), 400
            
    except Exception as e:
        current_app.logger.error(f"Payment verification failed: {e}")
        
        return jsonify({
            'success': False,
            'error': f'Payment verification failed: {str(e)}'
        }), 500


@payments_bp.route('/webhook/opay', methods=['POST'])
def opay_webhook():
    """OPay webhook endpoint"""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400
    
    # Verify webhook signature
    signature = request.headers.get('x-opay-signature')
    
    if not signature:
        return jsonify({'status': 'error', 'message': 'No signature'}), 400
    
    # Process webhook
    try:
        event = data.get('event')
        transaction_ref = data.get('data', {}).get('transaction_ref')
        
        payment = Payment.query.filter_by(reference=transaction_ref).first()
        
        if not payment:
            return jsonify({'status': 'error', 'message': 'Payment not found'}), 404
        
        if event == 'charge.success':
            payment.status = PaymentStatus.HELD
            payment.held_at = datetime.utcnow()
            db.session.commit()
            
            log_business_event(current_app, 'opay_webhook_success', {
                'payment_id': str(payment.id),
                'reference': payment.reference
            })
            
        elif event == 'charge.failed':
            payment.status = PaymentStatus.FAILED
            payment.failure_reason = data.get('data', {}).get('message')
            db.session.commit()
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        current_app.logger.error(f"OPay webhook error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@payments_bp.route('/webhook/paystack', methods=['POST'])
def paystack_webhook():
    """Paystack webhook endpoint"""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400
    
    # Verify webhook signature
    signature = request.headers.get('x-paystack-signature')
    
    if not signature:
        return jsonify({'status': 'error', 'message': 'No signature'}), 400
    
    # Process webhook
    try:
        event = data.get('event')
        
        if event == 'charge.success':
            transaction_data = data.get('data', {})
            reference = transaction_data.get('reference')
            
            payment = Payment.query.filter_by(reference=reference).first()
            
            if payment:
                payment.status = PaymentStatus.HELD
                payment.held_at = datetime.utcnow()
                db.session.commit()
                
                log_business_event(current_app, 'paystack_webhook_success', {
                    'payment_id': str(payment.id),
                    'reference': payment.reference
                })
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Paystack webhook error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@payments_bp.route('/webhook/flutterwave', methods=['POST'])
def flutterwave_webhook():
    """Flutterwave webhook endpoint"""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400
    
    # Verify webhook signature
    signature = request.headers.get('verif-hash')
    
    if not signature:
        return jsonify({'status': 'error', 'message': 'No signature'}), 400
    
    # Process webhook
    try:
        event = data.get('event')
        
        if event == 'charge.completed':
            transaction_data = data.get('data', {})
            reference = transaction_data.get('tx_ref')
            
            payment = Payment.query.filter_by(reference=reference).first()
            
            if payment:
                payment.status = PaymentStatus.HELD
                payment.held_at = datetime.utcnow()
                db.session.commit()
                
                log_business_event(current_app, 'flutterwave_webhook_success', {
                    'payment_id': str(payment.id),
                    'reference': payment.reference
                })
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Flutterwave webhook error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@payments_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Get payment details"""
    user = get_current_user()
    
    payment = Payment.query.get(payment_id)
    
    if not payment:
        return jsonify({
            'success': False,
            'error': 'Payment not found'
        }), 404
    
    # Check permission
    if str(payment.customer_id) != str(user.id) and str(payment.provider_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 403
    
    return jsonify({
        'success': True,
        'data': payment.to_dict()
    }), 200


@payments_bp.route('/job/<job_id>', methods=['GET'])
@jwt_required()
def get_job_payments(job_id):
    """Get payments for a job"""
    user = get_current_user()
    
    job = Job.query.get(job_id)
    
    if not job:
        return jsonify({
            'success': False,
            'error': 'Job not found'
        }), 404
    
    # Check permission
    if str(job.customer_id) != str(user.id) and str(job.provider_id) != str(user.id):
        return jsonify({
            'success': False,
            'error': 'Unauthorized'
        }), 403
    
    payments = Payment.query.filter_by(job_id=job_id).all()
    
    return jsonify({
        'success': True,
        'data': {
            'payments': [p.to_dict() for p in payments]
        }
    }), 200


@payments_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_payments():
    """Get current user's payments"""
    user = get_current_user()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Payments as customer
    customer_payments = Payment.query.filter_by(customer_id=user.id)
    
    # Payments as provider
    provider_payments = Payment.query.filter_by(provider_id=user.id)
    
    # Combine and paginate
    combined = customer_payments.union(provider_payments)
    paginated = combined.order_by(Payment.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'success': True,
        'data': {
            'payments': [p.to_dict() for p in paginated.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages
            }
        }
    }), 200