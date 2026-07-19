#!/usr/bin/env python
"""
Database seeding script for production
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.core.database import db
from app.models.user import User, UserRole
from app.models.provider import Provider
from app.models.job import Job, JobCategory
from app.core.security import hash_password

def seed_admin():
    """Create admin user if not exists"""
    app = create_app()
    with app.app_context():
        admin = User.query.filter_by(email='admin@rushng.com').first()
        if not admin:
            admin = User(
                email='admin@rushng.com',
                phone='+2348012345678',
                full_name='System Administrator',
                password_hash=hash_password('Admin@2024!'),
                role=UserRole.ADMIN,
                is_verified=True
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created")
        else:
            print("ℹ️ Admin user already exists")

def seed_service_categories():
    """Seed service categories if not exists"""
    app = create_app()
    with app.app_context():
        # This will be handled by the database migration
        # Categories are defined in the model
        print("✅ Service categories available")

def main():
    """Run all seed functions"""
    print("🌱 Seeding database...")
    seed_admin()
    seed_service_categories()
    print("✅ Seeding complete!")

if __name__ == '__main__':
    main()