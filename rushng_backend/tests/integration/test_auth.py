import json
import pytest

def test_register_success(client):
    """Test successful registration"""
    response = client.post('/api/auth/register', json={
        'email': 'newuser@example.com',
        'phone': '+2348012345670',
        'password': 'Password123',
        'full_name': 'New User'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert 'user' in data['data']

def test_register_duplicate_email(client):
    """Test registration with duplicate email"""
    # First registration
    client.post('/api/auth/register', json={
        'email': 'duplicate@example.com',
        'phone': '+2348012345671',
        'password': 'Password123',
        'full_name': 'Duplicate User'
    })
    
    # Second registration with same email
    response = client.post('/api/auth/register', json={
        'email': 'duplicate@example.com',
        'phone': '+2348012345672',
        'password': 'Password123',
        'full_name': 'Another User'
    })
    assert response.status_code == 409

def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPassword123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data['data']

def test_login_invalid_password(client):
    """Test login with invalid password"""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'WrongPassword'
    })
    assert response.status_code == 401