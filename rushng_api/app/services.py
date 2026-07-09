from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.models import ServiceType, User
from app.utils import admin_required

services_bp = Blueprint('services', __name__)

@services_bp.route('/', methods=['GET'])
def get_services():
    services = ServiceType.query.filter_by(is_active=True).order_by(ServiceType.sort_order).all()
    
    return jsonify({
        'success': True,
        'message': 'Services retrieved successfully',
        'data': {
            'services': [{
                'id': s.id,
                'name': s.name,
                'slug': s.slug,
                'description': s.description,
                'base_price': s.base_price,
                'price_per_km': s.price_per_km,
                'price_per_hour': s.price_per_hour,
                'is_active': s.is_active
            } for s in services]
        }
    }), 200

@services_bp.route('/<service_id>', methods=['GET'])
def get_service(service_id):
    service = ServiceType.query.get(service_id)
    
    if not service:
        return jsonify({'success': False, 'message': 'Service not found'}), 404
    
    return jsonify({
        'success': True,
        'message': 'Service retrieved successfully',
        'data': {
            'id': service.id,
            'name': service.name,
            'slug': service.slug,
            'description': service.description,
            'base_price': service.base_price,
            'price_per_km': service.price_per_km,
            'price_per_hour': service.price_per_hour
        }
    }), 200

@services_bp.route('/<service_id>/estimate', methods=['GET'])
def get_price_estimate(service_id):
    distance_km = request.args.get('distance_km', 0, type=float)
    duration_hours = request.args.get('duration_hours', 0, type=float)
    weight_kg = request.args.get('weight_kg', 0, type=float)
    
    service = ServiceType.query.get(service_id)
    
    if not service:
        return jsonify({'success': False, 'message': 'Service not found'}), 404
    
    # Calculate price
    calculated_price = service.base_price
    price_breakdown = {'base_price': service.base_price}
    
    if service.price_per_km and distance_km > 0:
        distance_charge = service.price_per_km * distance_km
        calculated_price += distance_charge
        price_breakdown['distance_charge'] = distance_charge
    
    if service.price_per_hour and duration_hours > 0:
        time_charge = service.price_per_hour * duration_hours
        calculated_price += time_charge
        price_breakdown['time_charge'] = time_charge
    
    service_fee = calculated_price * 0.10
    total_estimate = calculated_price + service_fee
    
    return jsonify({
        'success': True,
        'message': 'Price estimate calculated',
        'data': {
            'calculated_price': round(calculated_price, 2),
            'service_fee': round(service_fee, 2),
            'total_estimate': round(total_estimate, 2),
            'price_breakdown': price_breakdown
        }
    }), 200

@services_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_service():
    data = request.get_json()
    
    if not data.get('name') or not data.get('slug') or not data.get('base_price'):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    existing = ServiceType.query.filter_by(slug=data['slug']).first()
    if existing:
        return jsonify({'success': False, 'message': 'Service with this slug already exists'}), 409
    
    service = ServiceType(
        id=str(uuid.uuid4()),
        name=data['name'],
        slug=data['slug'],
        description=data.get('description'),
        icon=data.get('icon'),
        base_price=data['base_price'],
        price_per_km=data.get('price_per_km'),
        price_per_hour=data.get('price_per_hour'),
        is_active=data.get('is_active', True),
        sort_order=data.get('sort_order', 0)
    )
    
    db.session.add(service)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Service created successfully',
        'data': {'id': service.id}
    }), 201