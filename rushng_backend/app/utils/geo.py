"""
Geographic utility functions for RUSHNG
Handles distance calculations, location validation, and geocoding
"""

from math import radians, sin, cos, sqrt, atan2
import requests
from flask import current_app
import logging

logger = logging.getLogger(__name__)

# Earth's radius in kilometers
EARTH_RADIUS_KM = 6371


# ================================================================
# STANDALONE FUNCTIONS (for direct import)
# ================================================================

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate distance between two coordinates in kilometers using Haversine formula.
    
    Args:
        lat1: Latitude of point 1
        lng1: Longitude of point 1
        lat2: Latitude of point 2
        lng2: Longitude of point 2
        
    Returns:
        Distance in kilometers
    """
    lat1, lng1 = radians(lat1), radians(lng1)
    lat2, lng2 = radians(lat2), radians(lng2)
    
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    return EARTH_RADIUS_KM * c


def calculate_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates in meters."""
    return calculate_distance(lat1, lng1, lat2, lng2) * 1000


def is_within_radius(lat1: float, lng1: float, lat2: float, lng2: float, radius_km: float) -> bool:
    """Check if point 2 is within radius_km of point 1."""
    distance = calculate_distance(lat1, lng1, lat2, lng2)
    return distance <= radius_km


def get_eta(distance_km: float, speed_kmh: float = 30) -> int:
    """Calculate estimated time of arrival in minutes."""
    if distance_km <= 0:
        return 0
    hours = distance_km / speed_kmh
    return round(hours * 60)


def format_location(lat: float, lng: float) -> str:
    """Format coordinates for display."""
    lat_dir = 'N' if lat >= 0 else 'S'
    lng_dir = 'E' if lng >= 0 else 'W'
    return f"{abs(lat):.4f}°{lat_dir}, {abs(lng):.4f}°{lng_dir}"


def reverse_geocode(lat: float, lng: float) -> dict:
    """Reverse geocode coordinates to get address using OpenStreetMap Nominatim."""
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            'format': 'json',
            'lat': lat,
            'lon': lng,
            'zoom': 18,
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'RUSHNG/1.0 (https://rushng.com)'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data and 'display_name' in data:
                return {
                    'address': data.get('display_name'),
                    'city': data.get('address', {}).get('city') or 
                            data.get('address', {}).get('town') or 
                            data.get('address', {}).get('village'),
                    'state': data.get('address', {}).get('state'),
                    'country': data.get('address', {}).get('country'),
                    'postcode': data.get('address', {}).get('postcode'),
                    'lat': float(data.get('lat', lat)),
                    'lng': float(data.get('lon', lng))
                }
        return None
        
    except Exception as e:
        logger.error(f"Reverse geocoding error: {e}")
        return None


def geocode_address(address: str) -> dict:
    """Geocode address to coordinates using OpenStreetMap Nominatim."""
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'format': 'json',
            'q': address,
            'limit': 1,
            'addressdetails': 1
        }
        headers = {
            'User-Agent': 'RUSHNG/1.0 (https://rushng.com)'
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                location = data[0]
                return {
                    'lat': float(location.get('lat', 0)),
                    'lng': float(location.get('lon', 0)),
                    'address': location.get('display_name'),
                    'city': location.get('address', {}).get('city') or 
                            location.get('address', {}).get('town') or 
                            location.get('address', {}).get('village'),
                    'state': location.get('address', {}).get('state'),
                    'country': location.get('address', {}).get('country')
                }
        return None
        
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        return None


def validate_coordinates(lat: float, lng: float) -> bool:
    """Validate latitude and longitude coordinates."""
    try:
        lat = float(lat)
        lng = float(lng)
        return -90 <= lat <= 90 and -180 <= lng <= 180
    except (ValueError, TypeError):
        return False


def get_bounding_box(lat: float, lng: float, radius_km: float) -> dict:
    """Get bounding box around a point."""
    from math import cos, radians
    
    lat_deg_per_km = 1 / 111
    lng_deg_per_km = 1 / (111 * cos(radians(lat)))
    
    lat_offset = radius_km * lat_deg_per_km
    lng_offset = radius_km * lng_deg_per_km
    
    return {
        'min_lat': lat - lat_offset,
        'max_lat': lat + lat_offset,
        'min_lng': lng - lng_offset,
        'max_lng': lng + lng_offset
    }


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Same as calculate_distance - kept for compatibility."""
    return calculate_distance(lat1, lng1, lat2, lng2)


# ================================================================
# CLASS VERSION (for OOP approach)
# ================================================================

class GeoUtils:
    """Geographic utility class with static methods"""
    
    EARTH_RADIUS_KM = 6371
    
    @staticmethod
    def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in kilometers."""
        return calculate_distance(lat1, lng1, lat2, lng2)
    
    @staticmethod
    def calculate_distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in meters."""
        return calculate_distance_meters(lat1, lng1, lat2, lng2)
    
    @staticmethod
    def is_within_radius(lat1: float, lng1: float, lat2: float, lng2: float, radius_km: float) -> bool:
        """Check if point 2 is within radius_km of point 1."""
        return is_within_radius(lat1, lng1, lat2, lng2, radius_km)
    
    @staticmethod
    def get_eta(distance_km: float, speed_kmh: float = 30) -> int:
        """Calculate estimated time of arrival in minutes."""
        return get_eta(distance_km, speed_kmh)
    
    @staticmethod
    def format_location(lat: float, lng: float) -> str:
        """Format coordinates for display."""
        return format_location(lat, lng)
    
    @staticmethod
    def reverse_geocode(lat: float, lng: float) -> dict:
        """Reverse geocode coordinates to get address."""
        return reverse_geocode(lat, lng)
    
    @staticmethod
    def geocode_address(address: str) -> dict:
        """Geocode address to coordinates."""
        return geocode_address(address)
    
    @staticmethod
    def validate_coordinates(lat: float, lng: float) -> bool:
        """Validate latitude and longitude coordinates."""
        return validate_coordinates(lat, lng)
    
    @staticmethod
    def get_bounding_box(lat: float, lng: float, radius_km: float) -> dict:
        """Get bounding box around a point."""
        return get_bounding_box(lat, lng, radius_km)
    
    @staticmethod
    def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Same as calculate_distance - kept for compatibility."""
        return calculate_distance(lat1, lng1, lat2, lng2)
    
    @staticmethod
    def miles_to_km(miles: float) -> float:
        """Convert miles to kilometers."""
        return miles * 1.60934
    
    @staticmethod
    def km_to_miles(km: float) -> float:
        """Convert kilometers to miles."""
        return km * 0.621371
    
    @staticmethod
    def meters_to_km(meters: float) -> float:
        """Convert meters to kilometers."""
        return meters / 1000
    
    @staticmethod
    def km_to_meters(km: float) -> float:
        """Convert kilometers to meters."""
        return km * 1000