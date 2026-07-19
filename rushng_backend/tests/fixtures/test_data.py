import pytest
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.job import Job, JobCategory, JobStatus
from app.core.security import hash_password

@pytest.fixture
def sample_users(db_session):
    """Create sample users for testing"""
    users = [
        User(
            email=f'user{i}@example.com',
            phone=f'+234801234567{i}',
            full_name=f'User {i}',
            password_hash=hash_password('TestPassword123'),
            role=UserRole.CUSTOMER if i % 2 == 0 else UserRole.PROVIDER,
            is_verified=True
        )
        for i in range(1, 6)
    ]
    for user in users:
        db_session.add(user)
    db_session.commit()
    return users

@pytest.fixture
def sample_providers(db_session, sample_users):
    """Create sample providers"""
    providers = []
    for user in sample_users:
        if user.role == UserRole.PROVIDER:
            provider = Provider(
                user_id=user.id,
                skills=['plumbing', 'electrical', 'carpentry'],
                years_experience=5,
                hourly_rate=5000,
                service_radius_km=10,
                is_available=True
            )
            db_session.add(provider)
            providers.append(provider)
    db_session.commit()
    return providers