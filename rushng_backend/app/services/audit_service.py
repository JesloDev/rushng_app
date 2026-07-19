from datetime import datetime
from flask import current_app, request
from app.core.database import db
from app.models.audit_log import AuditLog
import json

class AuditService:
    """Handle audit logging for all system events"""
    
    @staticmethod
    def log_action(user_id, action, resource, resource_id=None, changes=None, request_obj=None):
        """Log an action to the audit log"""
        try:
            ip_address = None
            user_agent = None
            method = None
            
            if request_obj:
                ip_address = request_obj.remote_addr
                user_agent = request_obj.headers.get('User-Agent')
                method = request_obj.method
            
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource=resource,
                resource_id=resource_id,
                ip_address=ip_address,
                user_agent=user_agent,
                method=method,
                changes=changes or {}
            )
            
            db.session.add(audit_log)
            db.session.commit()
            
            return {'success': True}
            
        except Exception as e:
            current_app.logger.error(f"Audit log failed: {e}")
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def log_user_login(user_id, request_obj):
        """Log user login"""
        return AuditService.log_action(
            user_id,
            'user_login',
            'auth',
            None,
            {'ip': request_obj.remote_addr},
            request_obj
        )
    
    @staticmethod
    def log_user_logout(user_id, request_obj):
        """Log user logout"""
        return AuditService.log_action(
            user_id,
            'user_logout',
            'auth',
            None,
            {'ip': request_obj.remote_addr},
            request_obj
        )
    
    @staticmethod
    def log_job_created(user_id, job_id, job_data):
        """Log job creation"""
        return AuditService.log_action(
            user_id,
            'job_created',
            'job',
            job_id,
            {'job': job_data},
            request
        )
    
    @staticmethod
    def log_job_updated(user_id, job_id, changes):
        """Log job update"""
        return AuditService.log_action(
            user_id,
            'job_updated',
            'job',
            job_id,
            {'changes': changes},
            request
        )
    
    @staticmethod
    def log_payment_made(user_id, payment_id, amount):
        """Log payment"""
        return AuditService.log_action(
            user_id,
            'payment_made',
            'payment',
            payment_id,
            {'amount': amount},
            request
        )
    
    @staticmethod
    def log_violation_reported(user_id, violation_id, violation_data):
        """Log violation report"""
        return AuditService.log_action(
            user_id,
            'violation_reported',
            'violation',
            violation_id,
            {'violation': violation_data},
            request
        )
    
    @staticmethod
    def log_admin_action(user_id, action, resource, resource_id, details):
        """Log admin action"""
        return AuditService.log_action(
            user_id,
            f'admin_{action}',
            resource,
            resource_id,
            details,
            request
        )