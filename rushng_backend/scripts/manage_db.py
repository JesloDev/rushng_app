#!/usr/bin/env python
"""
Database management script for production
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask.cli import FlaskGroup
from app import create_app
from app.core.database import db
from sqlalchemy import text

app = create_app()
cli = FlaskGroup(app)


@cli.command('create-db')
def create_db():
    """Create all tables"""
    with app.app_context():
        db.create_all()
        print("✅ Tables created successfully!")


@cli.command('drop-db')
def drop_db():
    """Drop all tables"""
    confirm = input("⚠️  This will delete all data! Are you sure? (yes/no): ")
    if confirm == 'yes':
        with app.app_context():
            db.drop_all()
            print("✅ Tables dropped successfully!")
    else:
        print("❌ Cancelled")


@cli.command('reset-db')
def reset_db():
    """Reset database (drop and recreate)"""
    confirm = input("⚠️  This will delete all data! Are you sure? (yes/no): ")
    if confirm == 'yes':
        with app.app_context():
            db.drop_all()
            db.create_all()
            print("✅ Database reset successfully!")
    else:
        print("❌ Cancelled")


@cli.command('seed-admin')
def seed_admin():
    """Seed admin user"""
    from app.core.security import hash_password
    from app.models.user import User, UserRole
    
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


@cli.command('db-stats')
def db_stats():
    """Show database statistics"""
    with app.app_context():
        stats = {}
        tables = ['users', 'providers', 'jobs', 'payments', 'violations', 'ratings', 'notifications']
        
        for table in tables:
            count = db.session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            stats[table] = count
        
        print("\n📊 Database Statistics:")
        print("-" * 30)
        for table, count in stats.items():
            print(f"  {table}: {count:,}")
        print("-" * 30)
        print(f"  Total: {sum(stats.values()):,}")


if __name__ == '__main__':
    cli()