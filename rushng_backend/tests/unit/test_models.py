import pytest
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.job import Job, JobCategory, JobStatus
from app.core.security import hash_password

def test_user_creation(db_session):
    """Test user creation"""
    user = User(
        email='test@example.com',
        phone='+2348012345678',
        full_name='Test User',
        password_hash=hash_password('TestPassword123'),
        role=UserRole.CUSTOMER
    )
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.email == 'test@example.com'
    assert user.role == UserRole.CUSTOMER

def test_provider_creation(db_session):
    """Test provider creation"""
    user = User(
        email='provider@example.com',
        phone='+2348012345679',
        full_name='Provider User',
        password_hash=hash_password('TestPassword123'),
        role=UserRole.PROVIDER
    )
    db_session.add(user)
    db_session.commit()
    
    provider = Provider(
        user_id=user.id,
        skills=['plumbing', 'electrical'],
        years_experience=5,
        hourly_rate=5000
    )
    db_session.add(provider)
    db_session.commit()
    
    assert provider.id is not None
    assert 'plumbing' in provider.skills
    assert provider.hourly_rate == 5000

def test_job_creation(db_session, test_user):
    """Test job creation"""
    job = Job(
        customer_id=test_user.id,
        category=JobCategory.PLUMBING,
        title='Fix leaking pipe',
        description='Kitchen sink pipe is leaking badly',
        address='123 Main Street, Lagos',
        location='POINT(3.3792 6.5244)',
        estimated_price=15000,
        status=JobStatus.POSTED
    )
    db_session.add(job)
    db_session.commit()
    
    assert job.id is not None
    assert job.title == 'Fix leaking pipe'
    assert job.status == JobStatus.POSTED