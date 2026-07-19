import pytest
from app import create_app
from app.core.database import db
from app.models.user import User
from app.core.security import hash_password

@pytest.fixture
def app():
    """Create Flask app for testing"""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Test client"""
    return app.test_client()

@pytest.fixture
def test_user(db_session):
    """Create test user"""
    user = User(
        email='test@example.com',
        phone='+2348012345678',
        full_name='Test User',
        password_hash=hash_password('TestPassword123'),
        is_verified=True
    )
    db_session.add(user)
    db_session.commit()
    return user

@pytest.fixture
def auth_headers(test_user):
    """Get authentication headers"""
    from flask_jwt_extended import create_access_token
    access_token = create_access_token(identity=str(test_user.id))
    return {'Authorization': f'Bearer {access_token}'}

@pytest.fixture
def db_session(app):
    """Database session for tests"""
    with app.app_context():
        yield db.session