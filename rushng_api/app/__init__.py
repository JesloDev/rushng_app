from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config
from app.database import db, init_db
from app.auth import auth_bp, bcrypt
from app.services import services_bp
from app.bookings import bookings_bp
from app.merchants import merchants_bp
from app.payments import payments_bp
from app.reviews import reviews_bp  # <-- Add this import

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, origins=app.config['CORS_ORIGINS'])
    jwt = JWTManager(app)
    bcrypt.init_app(app)
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
    app.register_blueprint(merchants_bp, url_prefix='/api/merchants')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')  # <-- Add this line
    
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'database': 'postgresql'})
    
    @app.route('/')
    def root():
        return jsonify({
            'name': 'RUSHNG API',
            'version': '1.0.0',
            'status': 'running'
        })
    
    return app