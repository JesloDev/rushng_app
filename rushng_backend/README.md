# RUSHNG Backend API

Nigeria's premier service marketplace connecting customers with verified service providers.

## 🚀 Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Service Providers**: Register, verify, and manage providers
- **Job Management**: Post, assign, track, and complete jobs
- **Check-in/out**: GPS + Photo + OTP verification system
- **Payments**: Escrow with OPay, Paystack, Flutterwave
- **Accountability**: Violation tracking and penalty system
- **Ratings**: Two-way rating system
- **Notifications**: SMS and Email via Brevo

## 📦 Tech Stack

- **Framework**: Flask 3.x
- **Database**: PostgreSQL 16 with PostGIS
- **ORM**: SQLAlchemy with Alembic
- **Auth**: JWT with refresh tokens
- **Payments**: OPay, Paystack, Flutterwave
- **Notifications**: Brevo (SMS + Email)
- **Deployment**: Docker + Gunicorn + Nginx

## 🏗️ Architecture
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Customer │ │ Provider │ │ Admin │
│ App │ │ App │ │ Dashboard │
└─────────────┘ └─────────────┘ └─────────────┘
│ │ │
└───────────────────┼───────────────────┘
│
┌───────▼───────┐
│ Flask REST │
│ API │
└───────┬───────┘
│
┌───────────────────┼───────────────────┐
│ │ │
┌──────▼──────┐ ┌───────▼───────┐ ┌──────▼──────┐
│ PostgreSQL │ │ Redis │ │ External │
│ + PostGIS │ │ (Cache) │ │ Services │
└─────────────┘ └───────────────┘ └──────────────┘

## 🛠️ Installation

### Prerequisites

- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- Docker (optional)

### Local Development

```bash
# Clone repository
git clone https://github.com/rushng/rushng-backend.git
cd rushng-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
./scripts/init-db.sh

# Run migrations
flask db upgrade

# Run development server
python run.py

```
Docker Development
# Build and run
docker-compose up -d

# Run migrations
docker-compose exec api flask db upgrade

# Seed database
docker-compose exec api python scripts/seed.py

📚 API Documentation
Authentication
Method	Endpoint			Description
POST	/api/auth/register	Register new user
POST	/api/auth/login		Login user
POST	/api/auth/verify	Verify account
POST	/api/auth/refresh	Refresh token
POST	/api/auth/logout	Logout user

Jobs
Method	Endpoint					Description
POST	/api/jobs/					Create job
GET		/api/jobs/					List jobs
GET		/api/jobs/<id>				Get job details
POST	/api/jobs/<id>/apply		Apply to job
POST	/api/jobs/<id>/check-in		Start job
POST	/api/jobs/<id>/check-out	Complete job

Providers
Method	Endpoint					Description
POST	/api/providers/register		Register as provider
GET		/api/providers/me			Get provider profile
PUT		/api/providers/me			Update profile
POST	/api/providers/verify		Submit verification

Payments
Method	Endpoint					Description
POST	/api/payments/initialize	Initialize payment
POST	/api/payments/verify		Verify payment

Testing
# Run all tests
pytest tests/

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_models.py

# Run with markers
pytest -m "unit"


Deployment
# Using Docker
docker-compose -f docker-compose.prod.yml up -d

# Using manual deployment
./scripts/deploy.sh


🔒 Security

    JWT authentication with refresh tokens

    Password hashing with bcrypt

    Rate limiting on all endpoints

    CORS configured for specific origins

    SQL injection prevention via SQLAlchemy

    XSS protection via input sanitization

    HTTPS enforcement in production

📄 License

MIT
🤝 Contributing

    Fork the repository

    Create a feature branch

    Make your changes

    Run tests

    Submit a pull request

📞 Support

    Email: support@rushng.com

    Website: https://rushng.com


---

## ✅ **Summary of Missing Files**

| Folder/File | Status | Action Needed |
|-------------|--------|---------------|
| `logs/` | ⭐ Missing | Create folder and `.gitkeep` |
| `tests/` | ⭐ Missing | Create all test files |
| `static/` | ⭐ Missing | Create for static files |
| `uploads/` | ⭐ Missing | Create for user uploads |
| `.github/workflows/` | ⭐ Missing | Create CI/CD workflows |
| `pytest.ini` | ⭐ Missing | Create test configuration |
| `tox.ini` | ⭐ Missing | Create multi-env testing |
| `README.md` | ⭐ Missing | Create project documentation |
| `docs/` | ⭐ Missing | Create documentation folder |

---

## 🚀 **Quick Setup Commands**

```bash
# Create all missing directories
mkdir -p logs tests/unit tests/integration tests/fixtures static uploads docs .github/workflows

# Create .gitkeep files
touch logs/.gitkeep static/.gitkeep uploads/.gitkeep

# Create missing files
touch tests/__init__.py tests/unit/__init__.py tests/integration/__init__.py tests/fixtures/__init__.py
touch tests/conftest.py pytest.ini tox.ini README.md

# Create CI/CD workflow
touch .github/workflows/ci.yml .github/workflows/deploy.yml
```

