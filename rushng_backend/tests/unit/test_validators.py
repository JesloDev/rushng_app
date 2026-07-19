import pytest
from app.utils.validators import (
    validate_email, validate_phone, validate_password,
    validate_nin, validate_bvn, validate_location
)

def test_validate_email():
    assert validate_email('test@example.com') is True
    assert validate_email('invalid-email') is False
    assert validate_email('test@') is False

def test_validate_phone():
    assert validate_phone('+2348012345678') is True
    assert validate_phone('08012345678') is True
    assert validate_phone('1234567890') is False

def test_validate_password():
    assert validate_password('Password123') is True
    assert validate_password('pass') is False
    assert validate_password('password') is False  # No number
    assert validate_password('12345678') is False  # No letter

def test_validate_nin():
    assert validate_nin('12345678901') is True
    assert validate_nin('1234567890') is False

def test_validate_bvn():
    assert validate_bvn('12345678901') is True
    assert validate_bvn('1234567890') is False

def test_validate_location():
    assert validate_location(6.5244, 3.3792) is True
    assert validate_location(91, 0) is False
    assert validate_location(None, None) is False