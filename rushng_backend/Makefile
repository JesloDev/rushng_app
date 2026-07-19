# ================================================================
# RUSHNG - Makefile
# ================================================================

.PHONY: help install dev migrate seed test lint format clean

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	pip install --upgrade pip
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

dev: ## Run development server
	@echo "$(BLUE)🚀 Starting development server...$(NC)"
	python run.py

migrate: ## Run database migrations
	@echo "$(BLUE)🔄 Running migrations...$(NC)"
	flask db upgrade

migrate-init: ## Initialize migrations
	@echo "$(BLUE)📝 Initializing migrations...$(NC)"
	flask db init
	flask db migrate -m "Initial migration"
	flask db upgrade

seed: ## Seed the database
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	python scripts/seed.py

seed-test: ## Seed test data
	@echo "$(BLUE)🧪 Seeding test data...$(NC)"
	python scripts/seed_test_data.py

test: ## Run tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	pytest tests/ -v --cov=app --cov-report=html

lint: ## Run linters
	@echo "$(BLUE)🔍 Running linters...$(NC)"
	flake8 app/
	pylint app/

format: ## Format code
	@echo "$(BLUE)🎨 Formatting code...$(NC)"
	black app/
	isort app/

clean: ## Clean cache and temporary files
	@echo "$(BLUE)🧹 Cleaning...$(NC)"
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov
	rm -rf *.pyc
	rm -rf .mypy_cache
	rm -rf logs/*.log

build: ## Build Docker image
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	docker-compose build

up: ## Start Docker containers
	@echo "$(BLUE)🐳 Starting containers...$(NC)"
	docker-compose up -d

down: ## Stop Docker containers
	@echo "$(BLUE)🐳 Stopping containers...$(NC)"
	docker-compose down

logs: ## View logs
	@echo "$(BLUE)📋 Viewing logs...$(NC)"
	docker-compose logs -f

shell: ## Open Flask shell
	@echo "$(BLUE)🐚 Opening Flask shell...$(NC)"
	flask shell

db-reset: ## Reset database (warning: deletes all data!)
	@echo "$(RED)⚠️  This will delete all data! Are you sure? (y/N)$(NC)"
	@read -r confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "$(BLUE)🔄 Resetting database...$(NC)"; \
		flask db downgrade base; \
		flask db upgrade; \
		echo "$(GREEN)✅ Database reset complete$(NC)"; \
	else \
		echo "$(RED)❌ Cancelled$(NC)"; \
	fi

deploy: ## Deploy to production
	@echo "$(BLUE)🚀 Deploying to production...$(NC)"
	./scripts/deploy.sh