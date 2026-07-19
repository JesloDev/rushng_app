# ================================================================
# RUSHNG Backend - Dockerfile
# ================================================================

FROM python:3.11-slim

# ================================================================
# Build arguments
# ================================================================

ARG ENVIRONMENT=production
ARG SECRET_KEY
ARG DATABASE_URL

# ================================================================
# Environment variables
# ================================================================

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=${ENVIRONMENT} \
    SECRET_KEY=${SECRET_KEY} \
    DATABASE_URL=${DATABASE_URL}

# ================================================================
# System dependencies
# ================================================================

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ================================================================
# Create app user
# ================================================================

RUN adduser --disabled-password --gecos '' rushng
USER rushng

# ================================================================
# Working directory
# ================================================================

WORKDIR /app

# ================================================================
# Copy and install dependencies
# ================================================================

COPY --chown=rushng:rushng requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ================================================================
# Copy application code
# ================================================================

COPY --chown=rushng:rushng . .

# ================================================================
# Expose port
# ================================================================

EXPOSE 8000

# ================================================================
# Run the application
# ================================================================

CMD ["gunicorn", "-c", "gunicorn.conf.py", "wsgi:app"]