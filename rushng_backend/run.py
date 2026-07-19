#!/usr/bin/env python
"""
RUSHNG Backend - Application Entry Point
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_environment():
    """Check if required environment variables are set"""
    required_vars = ['SECRET_KEY', 'DATABASE_URL']
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        print("⚠️  Warning: Missing environment variables:")
        for var in missing:
            print(f"   - {var}")
        print("   Please copy .env.example to .env and fill in the values.")
        return False
    return True

def main():
    """Main entry point"""
    # Check environment
    if not check_environment():
        print("Continuing anyway...")
    
    # Import app
    try:
        from app import create_app
    except ImportError as e:
        print(f"❌ Failed to import app: {e}")
        print("   Make sure you're in the correct directory and have installed dependencies.")
        sys.exit(1)
    
    # Create app
    app = create_app()
    
    # Configuration
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 8000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    
    print("=" * 50)
    print("🚀 RUSHNG Backend")
    print(f"📍 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔧 Debug Mode: {debug}")
    print(f"🌐 Host: {host}:{port}")
    print("=" * 50)
    
    # Start server
    try:
        app.run(
            host=host,
            port=port,
            debug=debug,
            threaded=True,
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()