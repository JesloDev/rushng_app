import re
import requests
import json
from flask import current_app
import brevo_python
from brevo_python.rest import ApiException

def format_phone_e164(phone: str, default_country_code: str = "234") -> str:
    """
    Ensures a phone number is formatted strictly to E.164 standard required by Brevo.
    Examples:
      '07045787903'   -> '+2347045787903'
      '2347045787903'  -> '+2347045787903'
      '+2347045787903' -> '+2347045787903'
    """
    if not phone:
        return ""
        
    # Strip spaces, hyphens, and parenthetical symbols
    cleaned = re.sub(r'[\s\-\(\)]', '', str(phone).strip())

    if cleaned.startswith('+'):
        return cleaned

    if cleaned.startswith('0'):
        return f"+{default_country_code}{cleaned[1:]}"

    if cleaned.startswith(default_country_code):
        return f"+{cleaned}"

    return f"+{default_country_code}{cleaned}"


class NotificationService:
    """Handle notifications via Brevo (SMS + Email)"""
    
    @staticmethod
    def send_sms(phone, message):
        """Send SMS via Brevo"""
        try:
            # Format phone to proper E.164 (e.g. +2347045787903)
            formatted_phone = format_phone_e164(phone)
            
            url = "https://api.brevo.com/v3/transactionalSMS/sms"
            
            payload = {
                "sender": current_app.config.get('BREVO_SMS_SENDER', 'RUSHNG'),
                "recipient": formatted_phone,
                "content": message,
                "type": "transactional",
                "tag": "notification"
            }
            
            headers = {
                'api-key': current_app.config['BREVO_API_KEY'],
                'Content-Type': 'application/json',
                'accept': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            
            if response.status_code in (200, 201):
                current_app.logger.info(f"SMS sent to {formatted_phone}: {message[:50]}...")
                return {'success': True}
            else:
                current_app.logger.error(f"Brevo SMS error: {response.text}")
                return {'success': False, 'error': response.text}
                
        except Exception as e:
            current_app.logger.error(f"SMS sending failed: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def send_email(to_email, subject, html_content, template_id=None):
        """Send email via Brevo"""
        try:
            brevo_api = brevo_python.TransactionalEmailsApi(
                brevo_python.ApiClient(
                    brevo_python.Configuration()
                )
            )
            
            brevo_api.api_client.configuration.api_key['api-key'] = \
                current_app.config['BREVO_API_KEY']
            
            if template_id:
                # Use template
                send_smtp_email = brevo_python.SendSmtpEmail(
                    to=[{"email": to_email}],
                    template_id=template_id,
                    params={
                        "subject": subject,
                        "content": html_content
                    }
                )
            else:
                # Custom email
                send_smtp_email = brevo_python.SendSmtpEmail(
                    to=[{"email": to_email}],
                    sender={"name": "RUSHNG", "email": current_app.config.get('BREVO_EMAIL_FROM', 'noreply@rushng.com')},
                    subject=subject,
                    html_content=html_content
                )
            
            response = brevo_api.send_transac_email(send_smtp_email)
            
            current_app.logger.info(f"Email sent to {to_email}: {subject}")
            return {'success': True, 'message_id': response.message_id}
            
        except Exception as e:
            current_app.logger.error(f"Email sending failed: {e}")
            return {'success': False, 'error': str(e)}

    # ==================== TEMPLATED NOTIFICATIONS ====================
    
    @staticmethod
    def send_verification_sms(phone, code):
        """Send verification code via SMS"""
        message = f"Your RUSHNG verification code is: {code}. Valid for 10 minutes."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_job_notification(phone, job_title, price):
        """Send job notification to provider"""
        message = f"🔔 New job available on RUSHNG: {job_title}. Estimated: ₦{price:,.2f}. Accept now!"
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_provider_assigned_sms(phone, provider_name, job_title):
        """Send provider assignment notification to customer"""
        message = f"✅ A provider has been assigned to your job '{job_title}'. {provider_name} will be there soon."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_job_started_sms(phone, job_title, provider_name):
        """Send job started notification"""
        message = f"🔧 {provider_name} has started working on '{job_title}'. You will be notified when complete."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_job_completed_sms(phone, job_title, provider_name):
        """Send job completed notification"""
        message = f"✅ '{job_title}' has been completed by {provider_name}. Please confirm completion to release payment."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_payment_received_sms(phone, amount, job_title):
        """Send payment received notification to provider"""
        message = f"💰 Payment received! ₦{amount:,.2f} has been credited for '{job_title}'."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_rating_received_sms(phone, rater_name, rating, job_title):
        """Send rating received notification"""
        message = f"⭐ {rater_name} rated you {rating}/5 stars for '{job_title}'."
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_violation_confirmed_sms(phone, violation_title, points, penalty_type):
        """Send violation confirmation notification"""
        message = f"⚠️ Violation confirmed: {violation_title}. {points} points deducted. Penalty: {penalty_type}"
        return NotificationService.send_sms(phone, message)
    
    @staticmethod
    def send_violation_reported_admin(title, description, user_email):
        """Send violation report to admin via email"""
        subject = f"🚨 New Violation Reported: {title}"
        html_content = f"""
        <h2>New Violation Reported</h2>
        <p><strong>Title:</strong> {title}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>User:</strong> {user_email}</p>
        <p><a href="https://rushng.com/admin/violations">Review Violation</a></p>
        """
        return NotificationService.send_email('admin@rushng.com', subject, html_content)
    
    @staticmethod
    def send_account_deletion_email(email, user_id):
        """Send account deletion confirmation email"""
        subject = "RUSHNG Account Deletion Confirmation"
        html_content = f"""
        <h2>Account Deleted</h2>
        <p>Your RUSHNG account has been successfully deleted.</p>
        <p>If this was not you, please contact support immediately.</p>
        <p>Reference: {user_id}</p>
        """
        return NotificationService.send_email(email, subject, html_content)
    
    @staticmethod
    def send_password_reset_email(email, token):
        """Send password reset email"""
        subject = "Reset Your RUSHNG Password"
        reset_link = f"https://rushng.com/reset-password?token={token}"
        html_content = f"""
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't request this, ignore this email.</p>
        """
        return NotificationService.send_email(email, subject, html_content)