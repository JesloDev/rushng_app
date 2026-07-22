from datetime import datetime, timedelta
from flask import current_app
import random
import hashlib
import os
from geoalchemy2.functions import ST_Distance, ST_SetSRID, ST_Point

class VerificationService:
    """Handle verification services (check-in/out, OTP, GPS)"""
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(str(random.randint(0, 9)) for _ in range(6))
    
    @staticmethod
    def hash_otp(otp):
        """Hash an OTP for secure storage"""
        salt = os.urandom(32).hex()
        hashed = hashlib.sha256(f"{salt}{otp}".encode()).hexdigest()
        return f"{salt}${hashed}"
    
    @staticmethod
    def verify_otp(otp, stored_hash):
        """Verify an OTP against its stored hash"""
        try:
            salt, hashed = stored_hash.split('$')
            calculated = hashlib.sha256(f"{salt}{otp}".encode()).hexdigest()
            return hashed == calculated
        except:
            return False
    
    @staticmethod
    def verify_location(provider_lat, provider_lng, job_lat, job_lng, max_distance_m=100):
        """Verify if provider is within max_distance of job location"""
        from app.services.geo_service import GeoService
        
        distance = GeoService.calculate_distance(
            provider_lat, provider_lng,
            job_lat, job_lng
        )
        
        return distance <= max_distance_m / 1000  # Convert to km
    
    @staticmethod
    def verify_photo(photo_data):
        """Verify photo quality and validity"""
        try:
            import base64
            from PIL import Image
            from io import BytesIO
            
            # Decode base64 image
            if photo_data.startswith('data:image'):
                # Extract base64 part
                photo_data = photo_data.split(',')[1]
            
            image_data = base64.b64decode(photo_data)
            image = Image.open(BytesIO(image_data))
            
            # Check minimum size
            if image.width < 200 or image.height < 200:
                return {
                    'success': False,
                    'error': 'Image too small. Minimum 200x200 pixels required.'
                }
            
            # Check maximum size (5MB)
            if len(image_data) > 5 * 1024 * 1024:
                return {
                    'success': False,
                    'error': 'Image too large. Maximum 5MB allowed.'
                }
            
            return {
                'success': True,
                'width': image.width,
                'height': image.height,
                'format': image.format
            }
            
        except Exception as e:
            current_app.logger.error(f"Photo verification failed: {e}")
            return {
                'success': False,
                'error': 'Invalid image format'
            }
    
    @staticmethod
    def calculate_distance_matrix(origin_lat, origin_lng, destinations):
        """Calculate distances from origin to multiple destinations"""
        from app.services.geo_service import GeoService
        
        results = []
        for dest in destinations:
            distance = GeoService.calculate_distance(
                origin_lat, origin_lng,
                dest['lat'], dest['lng']
            )
            results.append({
                'destination': dest.get('name', 'Unknown'),
                'distance_km': round(distance, 2),
                'distance_m': round(distance * 1000, 0)
            })
        
        return results
    
    @staticmethod
    def verify_job_completion(job, customer_confirmation=True):
        """Verify job completion criteria"""
        checks = {
            'passed': [],
            'failed': []
        }
        
        # Check if job is in progress
        if job.status != 'in_progress':
            checks['failed'].append('Job not in progress')
        else:
            checks['passed'].append('Job in progress')
        
        # Check if check-in time exists
        if not job.check_in_time:
            checks['failed'].append('No check-in record')
        else:
            checks['passed'].append('Check-in recorded')
        
        # Check if check-out time exists
        if not job.check_out_time:
            checks['failed'].append('No check-out record')
        else:
            checks['passed'].append('Check-out recorded')
        
        # Check if check-out photo exists
        if not job.check_out_photo:
            checks['failed'].append('No completion photo')
        else:
            checks['passed'].append('Completion photo uploaded')
        
        # Check if customer confirmed
        if customer_confirmation:
            checks['passed'].append('Customer confirmed')
        
        return {
            'success': len(checks['failed']) == 0,
            'passed': checks['passed'],
            'failed': checks['failed']
        }