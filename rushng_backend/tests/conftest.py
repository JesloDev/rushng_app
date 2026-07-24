# tests/conftest.py
import pytest
from app import create_app
from app.core.database import db
from app.models.user import User
from app.core.security import hash_password

@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture(scope='function')
def db_session(app):
    """Provides a clean database session for each individual test."""
    with app.app_context():
        # Ensure any leftover transactions are cleared
        db.session.rollback()
        
        # Truncate/clear all tables before the test runs
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()

        yield db.session

        # Roll back and remove session after the test ends
        db.session.rollback()
        db.session.close()

@pytest.fixture
def client(app, db_session):
    """Test client that shares the clean db_session context."""
    return app.test_client()

@pytest.fixture
def test_user(db_session):
    """Create a fresh test user per test."""
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
    """Get authentication headers."""
    from flask_jwt_extended import create_access_token
    access_token = create_access_token(identity=str(test_user.id))
    return {'Authorization': f'Bearer {access_token}'}