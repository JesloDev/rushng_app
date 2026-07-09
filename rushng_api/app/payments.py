from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
import json
import requests
import hmac
import hashlib
from app.database import db
from app.models import Payment, Booking, User
from app.utils import generate_tracking_code

payments_bp = Blueprint('payments', __name__)

@payments_bp.route('/initialize', methods=['POST'])
@jwt_required()
def initialize_payment():
    """Initialize a payment with Paystack"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    booking_id = data.get('booking_id')
    method = data.get('method', 'card')
    
    if not booking_id:
        return jsonify({
            'success': False,
            'message': 'Booking ID is required'
        }), 400
    
    # Get booking
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    # Check if already paid
    existing_payment = Payment.query.filter_by(
        booking_id=booking_id,
        status='success'
    ).first()
    
    if existing_payment:
        return jsonify({
            'success': False,
            'message': 'This booking has already been paid for'
        }), 400
    
    # For cash payments, just record and return
    if method == 'cash':
        payment = Payment(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            amount=booking.total_price + booking.service_fee,
            method='cash',
            status='pending',
            reference=f'CASH-{uuid.uuid4().hex[:8].upper()}'
        )
        db.session.add(payment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Cash payment recorded',
            'data': {
                'payment_id': payment.id,
                'status': 'pending',
                'amount': payment.amount,
                'reference': payment.reference
            }
        }), 200
    
    # For card/wallet payments, initialize Paystack
    paystack_secret = current_app.config.get('PAYSTACK_SECRET_KEY')
    
    if not paystack_secret or paystack_secret == '':
        # Mock payment for development
        reference = f'MOCK-{uuid.uuid4().hex[:8].upper()}'
        payment = Payment(
            id=str(uuid.uuid4()),
            booking_id=booking_id,
            amount=booking.total_price + booking.service_fee,
            method=method,
            status='success' if method != 'wallet' else 'pending',
            reference=reference,
            payment_metadata={'mock': True}
        )
        db.session.add(payment)
        
        # Update booking status if payment successful
        if method != 'wallet':
            booking.status = 'accepted'
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment successful (mock mode)',
            'data': {
                'payment_id': payment.id,
                'status': payment.status,
                'reference': reference,
                'amount': payment.amount,
                'authorization_url': None
            }
        }), 200
    
    # Real Paystack integration
    try:
        user = User.query.get(user_id)
        callback_url = current_app.config.get('PAYSTACK_CALLBACK_URL', 'http://localhost:3000/payment/verify')
        reference = f'RSH-{uuid.uuid4().hex[:12].upper()}'
        
        payload = {
            'email': user.email if user else 'customer@rushng.com',
            'amount': int((booking.total_price + booking.service_fee) * 100),  # Paystack uses kobo
            'reference': reference,
            'callback_url': callback_url,
            'metadata': {
                'booking_id': booking_id,
                'user_id': user_id,
                'amount': booking.total_price + booking.service_fee
            }
        }
        
        headers = {
            'Authorization': f'Bearer {paystack_secret}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            'https://api.paystack.co/transaction/initialize',
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status'):
                # Save payment record
                payment = Payment(
                    id=str(uuid.uuid4()),
                    booking_id=booking_id,
                    amount=booking.total_price + booking.service_fee,
                    method=method,
                    status='pending',
                    reference=reference,
                    transaction_id=result['data'].get('id'),
                    payment_metadata={
                        'paystack_response': result['data']
                    }
                )
                db.session.add(payment)
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Payment initialized',
                    'data': {
                        'payment_id': payment.id,
                        'reference': reference,
                        'amount': payment.amount,
                        'authorization_url': result['data']['authorization_url'],
                        'access_code': result['data'].get('access_code')
                    }
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': result.get('message', 'Paystack initialization failed')
                }), 400
        
        return jsonify({
            'success': False,
            'message': f'Paystack API error: {response.status_code}'
        }), 500
        
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'message': 'Paystack connection timeout. Please try again.'
        }), 504
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'message': f'Payment service error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Payment initialization error: {str(e)}'
        }), 500


@payments_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    """Verify a Paystack payment"""
    data = request.get_json()
    user_id = get_jwt_identity()
    
    reference = data.get('reference')
    
    if not reference:
        return jsonify({
            'success': False,
            'message': 'Reference is required'
        }), 400
    
    # Check if it's a mock payment
    if reference.startswith('MOCK-'):
        payment = Payment.query.filter_by(reference=reference).first()
        if payment and payment.status == 'success':
            return jsonify({
                'success': True,
                'message': 'Payment verified (mock)',
                'data': {
                    'payment_id': payment.id,
                    'status': 'success',
                    'amount': payment.amount,
                    'booking_id': payment.booking_id
                }
            }), 200
    
    # Get payment
    payment = Payment.query.filter_by(reference=reference).first()
    
    if not payment:
        return jsonify({
            'success': False,
            'message': 'Payment record not found'
        }), 404
    
    # Verify with Paystack
    paystack_secret = current_app.config.get('PAYSTACK_SECRET_KEY')
    
    if not paystack_secret or paystack_secret == '':
        # Mock verification
        if payment.status == 'pending':
            payment.status = 'success'
            # Update booking
            booking = Booking.query.get(payment.booking_id)
            if booking:
                booking.status = 'accepted'
            db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Payment verified (mock)',
            'data': {
                'payment_id': payment.id,
                'status': payment.status,
                'amount': payment.amount,
                'booking_id': payment.booking_id
            }
        }), 200
    
    try:
        headers = {
            'Authorization': f'Bearer {paystack_secret}'
        }
        
        response = requests.get(
            f'https://api.paystack.co/transaction/verify/{reference}',
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            if result.get('status') and result['data']['status'] == 'success':
                # Update payment status
                payment.status = 'success'
                payment.transaction_id = result['data'].get('id')
                payment.payment_metadata = {
                    'paystack_response': result['data'],
                    'verified_at': datetime.utcnow().isoformat()
                }
                
                # Update booking status
                booking = Booking.query.get(payment.booking_id)
                if booking:
                    booking.status = 'accepted'
                
                db.session.commit()
                
                return jsonify({
                    'success': True,
                    'message': 'Payment verified successfully',
                    'data': {
                        'payment_id': payment.id,
                        'status': 'success',
                        'amount': payment.amount,
                        'booking_id': payment.booking_id
                    }
                }), 200
            else:
                # Payment failed or pending
                payment.status = 'failed' if result['data']['status'] == 'failed' else 'pending'
                db.session.commit()
                
                return jsonify({
                    'success': False,
                    'message': f"Payment {result['data']['status']}",
                    'data': {
                        'payment_id': payment.id,
                        'status': payment.status
                    }
                }), 400
        
        return jsonify({
            'success': False,
            'message': f'Paystack verification failed: {response.status_code}'
        }), 500
        
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'message': 'Paystack connection timeout. Please try again.'
        }), 504
    except requests.exceptions.RequestException as e:
        return jsonify({
            'success': False,
            'message': f'Verification service error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Verification error: {str(e)}'
        }), 500


@payments_bp.route('/webhook/paystack', methods=['POST'])
def paystack_webhook():
    """Paystack webhook endpoint"""
    data = request.get_json()
    
    if not data:
        return jsonify({'status': 'error', 'message': 'No data received'}), 400
    
    # Verify webhook signature (optional but recommended)
    signature = request.headers.get('x-paystack-signature')
    
    if not signature:
        return jsonify({'status': 'error', 'message': 'No signature'}), 400
    
    # Verify signature
    paystack_secret = current_app.config.get('PAYSTACK_SECRET_KEY')
    if paystack_secret:
        expected_signature = hmac.new(
            paystack_secret.encode('utf-8'),
            request.data,
            hashlib.sha512
        ).hexdigest()
        
        if signature != expected_signature:
            return jsonify({'status': 'error', 'message': 'Invalid signature'}), 400
    
    # Process webhook event
    event = data.get('event')
    
    if event == 'charge.success':
        transaction_data = data.get('data', {})
        reference = transaction_data.get('reference')
        amount = transaction_data.get('amount', 0) / 100  # Convert from kobo
        transaction_id = transaction_data.get('id')
        
        # Find payment
        payment = Payment.query.filter_by(reference=reference).first()
        
        if payment:
            # Update payment status
            payment.status = 'success'
            payment.transaction_id = transaction_id
            payment.payment_metadata = {
                'webhook_data': transaction_data,
                'verified_at': datetime.utcnow().isoformat()
            }
            
            # Update booking status
            booking = Booking.query.get(payment.booking_id)
            if booking:
                booking.status = 'accepted'
            
            db.session.commit()
            
            return jsonify({'status': 'success'}), 200
        else:
            # Payment not found - could be a duplicate webhook
            return jsonify({'status': 'error', 'message': 'Payment not found'}), 404
    
    elif event == 'charge.failed' or event == 'charge.dispute.create':
        reference = data.get('data', {}).get('reference')
        payment = Payment.query.filter_by(reference=reference).first()
        
        if payment:
            payment.status = 'failed'
            db.session.commit()
    
    return jsonify({'status': 'success'}), 200


@payments_bp.route('/<payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Get payment details"""
    user_id = get_jwt_identity()
    
    payment = Payment.query.get(payment_id)
    
    if not payment:
        return jsonify({
            'success': False,
            'message': 'Payment not found'
        }), 404
    
    # Check permission
    booking = Booking.query.get(payment.booking_id)
    if not booking or (booking.user_id != user_id and not current_app.config.get('DEBUG')):
        return jsonify({
            'success': False,
            'message': 'Unauthorized access'
        }), 403
    
    return jsonify({
        'success': True,
        'message': 'Payment retrieved successfully',
        'data': {
            'id': payment.id,
            'booking_id': payment.booking_id,
            'amount': payment.amount,
            'method': payment.method,
            'status': payment.status,
            'reference': payment.reference,
            'created_at': payment.created_at.isoformat(),
            'updated_at': payment.updated_at.isoformat() if payment.updated_at else None
        }
    }), 200


@payments_bp.route('/booking/<booking_id>', methods=['GET'])
@jwt_required()
def get_booking_payments(booking_id):
    """Get all payments for a booking"""
    user_id = get_jwt_identity()
    
    booking = Booking.query.filter_by(id=booking_id, user_id=user_id).first()
    
    if not booking:
        return jsonify({
            'success': False,
            'message': 'Booking not found'
        }), 404
    
    payments = Payment.query.filter_by(booking_id=booking_id).all()
    
    return jsonify({
        'success': True,
        'message': 'Payments retrieved successfully',
        'data': {
            'payments': [{
                'id': p.id,
                'amount': p.amount,
                'method': p.method,
                'status': p.status,
                'reference': p.reference,
                'created_at': p.created_at.isoformat()
            } for p in payments]
        }
    }), 200


@payments_bp.route('/methods', methods=['GET'])
def get_payment_methods():
    """Get available payment methods"""
    return jsonify({
        'success': True,
        'message': 'Payment methods retrieved',
        'data': {
            'methods': [
                {
                    'id': 'card',
                    'name': 'Card (Paystack)',
                    'icon': 'credit-card',
                    'type': 'online',
                    'available': True
                },
                {
                    'id': 'wallet',
                    'name': 'Wallet',
                    'icon': 'wallet',
                    'type': 'online',
                    'available': True
                },
                {
                    'id': 'cash',
                    'name': 'Cash on Delivery',
                    'icon': 'cash',
                    'type': 'offline',
                    'available': True
                }
            ]
        }
    }), 200