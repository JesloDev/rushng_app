from math import radians, sin, cos, sqrt, atan2
import requests
from flask import current_app

class GeoService:
    """Handle geographic calculations and services"""
    
    @staticmethod
    def calculate_distance(lat1, lng1, lat2, lng2):
        """Calculate distance between two points in kilometers using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        lat1, lng1 = radians(lat1), radians(lng1)
        lat2, lng2 = radians(lat2), radians(lng2)
        
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    @staticmethod
    def format_location(lat, lng):
        """Format location for GeoAlchemy"""
        return f'POINT({lng} {lat})'  # GeoAlchemy uses POINT(lng lat)
    
    @staticmethod
    def get_address_from_coords(lat, lng):
        """Reverse geocoding to get address from coordinates"""
        try:
            # Using OpenStreetMap Nominatim (free, no API key required)
            url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lng}"
            response = requests.get(url, headers={'User-Agent': 'RUSHNG'})
            
            if response.status_code == 200:
                data = response.json()
                return data.get('display_name', f'{lat}, {lng}')
            else:
                return f'{lat}, {lng}'
                
        except Exception as e:
            current_app.logger.error(f"Reverse geocoding failed: {e}")
            return f'{lat}, {lng}'
    
    @staticmethod
    def get_coords_from_address(address):
        """Geocoding to get coordinates from address"""
        try:
            url = f"https://nominatim.openstreetmap.org/search?format=json&q={address}"
            response = requests.get(url, headers={'User-Agent': 'RUSHNG'})
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    return {
                        'lat': float(data[0]['lat']),
                        'lng': float(data[0]['lon']),
                        'display_name': data[0].get('display_name', address)
                    }
                else:
                    return None
            else:
                return None
                
        except Exception as e:
            current_app.logger.error(f"Geocoding failed: {e}")
            return None
    
    @staticmethod
    def get_eta(distance_km, speed_kmh=30):
        """Calculate estimated time of arrival in minutes"""
        hours = distance_km / speed_kmh
        return round(hours * 60)  # Return minutes
    
    @staticmethod
    def is_within_radius(lat1, lng1, lat2, lng2, radius_km):
        """Check if a point is within a radius of another point"""
        distance = GeoService.calculate_distance(lat1, lng1, lat2, lng2)
        return distance <= radius_km