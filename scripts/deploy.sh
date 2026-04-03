#!/bin/bash

# Invoice Generator Deployment Script
# This script handles the deployment of the invoice generator application

set -e

# Configuration
APP_NAME="invoice-generator"
DOCKER_REGISTRY="ghcr.io"
IMAGE_NAME="$DOCKER_REGISTRY/your-org/$APP_NAME"
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        log_warn "Helm is not installed, skipping Helm deployment"
    fi
    
    log_info "Dependencies check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build -t "$IMAGE_NAME:$VERSION" .
    docker tag "$IMAGE_NAME:$VERSION" "$IMAGE_NAME:latest"
    
    log_info "Docker image built successfully"
}

# Push Docker image
push_image() {
    log_info "Pushing Docker image..."
    
    echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u "$DOCKER_USERNAME" --password-stdin
    docker push "$IMAGE_NAME:$VERSION"
    docker push "$IMAGE_NAME:latest"
    
    log_info "Docker image pushed successfully"
}

# Deploy to Kubernetes
deploy_k8s() {
    log_info "Deploying to Kubernetes ($ENVIRONMENT)..."
    
    # Set the correct namespace
    kubectl config use-context $ENVIRONMENT || {
        log_error "Failed to switch to $ENVIRONMENT context"
        exit 1
    }
    
    # Apply namespace
    kubectl apply -f k8s/namespace.yml
    
    # Apply secrets
    kubectl apply -f k8s/secrets.yml
    
    # Apply deployment
    envsubst < k8s/deployment.yml | kubectl apply -f -
    
    # Wait for deployment to be ready
    kubectl rollout status deployment/invoice-app --timeout=300s
    
    log_info "Kubernetes deployment completed"
}

# Deploy with Docker Compose
deploy_compose() {
    log_info "Deploying with Docker Compose ($ENVIRONMENT)..."
    
    case $ENVIRONMENT in
        "development")
            docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
            ;;
        "staging")
            docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
            ;;
        "production")
            docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_info "Docker Compose deployment completed"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    # Wait for application to start
    sleep 30
    
    # Check application health
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_info "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
}

# Run smoke tests
smoke_tests() {
    log_info "Running smoke tests..."
    
    # Test basic functionality
    curl -f http://localhost:3000/api/health > /dev/null 2>&1 || {
        log_error "API health check failed"
        exit 1
    }
    
    # Test database connection
    curl -f http://localhost:3000/api/health/db > /dev/null 2>&1 || {
        log_error "Database health check failed"
        exit 1
    }
    
    log_info "Smoke tests passed"
}

# Rollback deployment
rollback() {
    log_warn "Rolling back deployment..."
    
    kubectl rollout undo deployment/invoice-app
    kubectl rollout status deployment/invoice-app --timeout=300s
    
    log_info "Rollback completed"
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove unused containers
    docker container prune -f
    
    log_info "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment of $APP_NAME to $ENVIRONMENT..."
    
    # Check if this is a rollback
    if [ "$1" = "rollback" ]; then
        rollback
        exit 0
    fi
    
    # Run deployment steps
    check_dependencies
    build_image
    push_image
    
    # Choose deployment method
    if command -v kubectl &> /dev/null && kubectl cluster-info &> /dev/null; then
        deploy_k8s
    else
        deploy_compose
    fi
    
    # Run checks
    health_check
    smoke_tests
    
    # Cleanup
    cleanup
    
    log_info "Deployment completed successfully! 🎉"
    
    # Display application URL
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Application URL: https://your-domain.com"
    else
        echo "Application URL: http://localhost:3000"
    fi
}

# Handle script arguments
case "${1:-}" in
    "build")
        build_image
        ;;
    "push")
        push_image
        ;;
    "deploy")
        main
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {build|push|deploy|rollback|health|cleanup} [environment] [version]"
        echo "  build     - Build Docker image"
        echo "  push      - Push Docker image to registry"
        echo "  deploy    - Deploy application (default)"
        echo "  rollback  - Rollback to previous version"
        echo "  health    - Run health checks"
        echo "  cleanup   - Clean up resources"
        echo ""
        echo "Environments: development, staging, production"
        echo "Version: latest, git SHA, or semantic version"
        exit 1
        ;;
esac
