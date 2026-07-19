import requests
import json
from datetime import datetime
from flask import current_app
from app.core.config import config

class PaymentService:
    """Handle payment processing with OPay, Paystack, and Flutterwave"""
    
    @staticmethod
    def initialize_opay_payment(payment, customer, provider):
        """Initialize OPay payment"""
        try:
            url = f"{current_app.config['OPAY_BASE_URL']}/payment/initialize"
            
            payload = {
                "amount": payment.amount,
                "currency": "NGN",
                "reference": payment.reference,
                "customer": {
                    "email": customer.email,
                    "phone": customer.phone,
                    "name": customer.full_name
                },
                "metadata": {
                    "payment_id": str(payment.id),
                    "job_id": str(payment.job_id),
                    "provider_id": str(provider.id)
                },
                "callback_url": current_app.config.get('OPAY_CALLBACK_URL', 
                    'https://rushng.com/payment/verify')
            }
            
            headers = {
                'Authorization': f'Bearer {current_app.config["OPAY_API_KEY"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'authorization_url': data.get('data', {}).get('authorization_url'),
                    'transaction_ref': data.get('data', {}).get('transaction_ref')
                }
            else:
                return {
                    'success': False,
                    'message': f"OPay error: {response.text}"
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'message': 'OPay connection timeout'
            }
        except Exception as e:
            current_app.logger.error(f"OPay initialization error: {e}")
            return {
                'success': False,
                'message': f'OPay error: {str(e)}'
            }
    
    @staticmethod
    def verify_opay_payment(payment):
        """Verify OPay payment"""
        try:
            url = f"{current_app.config['OPAY_BASE_URL']}/payment/verify/{payment.reference}"
            
            headers = {
                'Authorization': f'Bearer {current_app.config["OPAY_API_KEY"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    return {
                        'status': 'success',
                        'message': 'Payment verified successfully'
                    }
                else:
                    return {
                        'status': 'failed',
                        'message': data.get('message', 'Payment verification failed')
                    }
            else:
                return {
                    'status': 'failed',
                    'message': f"OPay verification error: {response.text}"
                }
                
        except Exception as e:
            current_app.logger.error(f"OPay verification error: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    @staticmethod
    def initialize_paystack_payment(payment, customer, provider):
        """Initialize Paystack payment"""
        try:
            url = "https://api.paystack.co/transaction/initialize"
            
            payload = {
                "amount": int(payment.amount * 100),  # Paystack uses kobo
                "email": customer.email,
                "reference": payment.reference,
                "callback_url": current_app.config.get('PAYSTACK_CALLBACK_URL',
                    'https://rushng.com/payment/verify'),
                "metadata": {
                    "payment_id": str(payment.id),
                    "job_id": str(payment.job_id),
                    "provider_id": str(provider.id),
                    "customer_id": str(customer.id)
                }
            }
            
            headers = {
                'Authorization': f'Bearer {current_app.config["PAYSTACK_SECRET_KEY"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status'):
                    return {
                        'success': True,
                        'authorization_url': data.get('data', {}).get('authorization_url'),
                        'transaction_ref': data.get('data', {}).get('reference')
                    }
                else:
                    return {
                        'success': False,
                        'message': data.get('message', 'Paystack initialization failed')
                    }
            else:
                return {
                    'success': False,
                    'message': f"Paystack error: {response.text}"
                }
                
        except Exception as e:
            current_app.logger.error(f"Paystack initialization error: {e}")
            return {
                'success': False,
                'message': str(e)
            }
    
    @staticmethod
    def verify_paystack_payment(payment):
        """Verify Paystack payment"""
        try:
            url = f"https://api.paystack.co/transaction/verify/{payment.reference}"
            
            headers = {
                'Authorization': f'Bearer {current_app.config["PAYSTACK_SECRET_KEY"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') and data.get('data', {}).get('status') == 'success':
                    return {
                        'status': 'success',
                        'message': 'Payment verified successfully'
                    }
                else:
                    return {
                        'status': 'failed',
                        'message': data.get('message', 'Payment verification failed')
                    }
            else:
                return {
                    'status': 'failed',
                    'message': f"Paystack verification error: {response.text}"
                }
                
        except Exception as e:
            current_app.logger.error(f"Paystack verification error: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    @staticmethod
    def initialize_flutterwave_payment(payment, customer, provider):
        """Initialize Flutterwave payment"""
        try:
            url = f"{current_app.config['FLUTTERWAVE_BASE_URL']}/payments"
            
            payload = {
                "tx_ref": payment.reference,
                "amount": payment.amount,
                "currency": "NGN",
                "redirect_url": current_app.config.get('FLUTTERWAVE_CALLBACK_URL',
                    'https://rushng.com/payment/verify'),
                "payment_options": "card,ussd,banktransfer",
                "meta": {
                    "payment_id": str(payment.id),
                    "job_id": str(payment.job_id),
                    "provider_id": str(provider.id)
                },
                "customer": {
                    "email": customer.email,
                    "phonenumber": customer.phone,
                    "name": customer.full_name
                },
                "customizations": {
                    "title": "RUSHNG Payment",
                    "description": f"Payment for job {payment.job_id}",
                    "logo": "https://rushng.com/logo.png"
                }
            }
            
            headers = {
                'Authorization': f'Bearer {current_app.config["FLUTTERWAVE_SECRET_KEY"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    return {
                        'success': True,
                        'authorization_url': data.get('data', {}).get('link'),
                        'transaction_ref': data.get('data', {}).get('tx_ref')
                    }
                else:
                    return {
                        'success': False,
                        'message': data.get('message', 'Flutterwave initialization failed')
                    }
            else:
                return {
                    'success': False,
                    'message': f"Flutterwave error: {response.text}"
                }
                
        except Exception as e:
            current_app.logger.error(f"Flutterwave initialization error: {e}")
            return {
                'success': False,
                'message': str(e)
            }
    
    @staticmethod
    def verify_flutterwave_payment(payment):
        """Verify Flutterwave payment"""
        try:
            url = f"{current_app.config['FLUTTERWAVE_BASE_URL']}/transactions/{payment.reference}/verify"
            
            headers = {
                'Authorization': f'Bearer {current_app.config["FLUTTERWAVE_SECRET_KEY"]}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and data.get('data', {}).get('status') == 'successful':
                    return {
                        'status': 'success',
                        'message': 'Payment verified successfully'
                    }
                else:
                    return {
                        'status': 'failed',
                        'message': data.get('message', 'Payment verification failed')
                    }
            else:
                return {
                    'status': 'failed',
                    'message': f"Flutterwave verification error: {response.text}"
                }
                
        except Exception as e:
            current_app.logger.error(f"Flutterwave verification error: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    @staticmethod
    def release_payment(job_id):
        """Release payment from escrow to provider"""
        from app.models.payment import Payment, PaymentStatus
        from app.models.job import Job
        from app.core.database import db
        
        payment = Payment.query.filter_by(job_id=job_id).first()
        
        if not payment:
            return {
                'success': False,
                'message': 'Payment not found'
            }
        
        if payment.status != PaymentStatus.HELD:
            return {
                'success': False,
                'message': f'Payment is not in escrow. Current status: {payment.status.value}'
            }
        
        # Release payment
        payment.release()
        db.session.commit()
        
        # Update job
        job = Job.query.get(job_id)
        if job:
            # Update provider stats
            provider_user = User.query.get(job.provider_id)
            if provider_user and provider_user.provider:
                provider_user.provider.total_jobs_completed += 1
                provider_user.provider.total_earnings += payment.provider_earnings
                db.session.commit()
        
        # Send notification to provider
        try:
            from app.services.notification_service import NotificationService
            provider = User.query.get(payment.provider_id)
            if provider:
                NotificationService.send_payment_received_sms(
                    provider.phone,
                    payment.provider_earnings,
                    job.title if job else 'job'
                )
        except Exception as e:
            current_app.logger.error(f"Failed to send payment notification: {e}")
        
        return {
            'success': True,
            'message': 'Payment released successfully'
        }