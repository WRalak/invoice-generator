# Invoice Generator - Deployment Guide

This guide covers the deployment of the Invoice Generator application using various DevOps tools and methodologies.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring and Observability](#monitoring-and-observability)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- Node.js 18+
- Docker & Docker Compose
- kubectl (for Kubernetes deployment)
- Helm (optional, for Helm charts)
- Git

### Environment Variables
Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-key

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/invoicedb

# Redis
REDIS_URL=redis://localhost:6379

# Docker Registry
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
```

## Local Development

### Quick Start
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

### Database Setup
```bash
# Start PostgreSQL and Redis
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## Docker Deployment

### Single Container
```bash
# Build the image
docker build -t invoice-generator .

# Run the container
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e NEXTAUTH_SECRET=your-secret \
  invoice-generator
```

### Docker Compose
```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale the application
docker-compose -f docker-compose.yml up -d --scale app=3
```

### Docker Compose Files
- `docker-compose.yml` - Base configuration
- `docker-compose.dev.yml` - Development overrides
- `docker-compose.staging.yml` - Staging environment
- `docker-compose.prod.yml` - Production environment

## Kubernetes Deployment

### Quick Deploy
```bash
# Deploy to Kubernetes
./scripts/deploy.sh deploy staging

# Deploy to production
./scripts/deploy.sh deploy production

# Check deployment status
kubectl get pods -l app=invoice-app
kubectl get services
kubectl get ingress
```

### Manual Kubernetes Steps
```bash
# Create namespace
kubectl apply -f k8s/namespace.yml

# Apply secrets
kubectl apply -f k8s/secrets.yml

# Apply deployment
kubectl apply -f k8s/deployment.yml

# Check rollout status
kubectl rollout status deployment/invoice-app
```

### Kubernetes Files
- `k8s/namespace.yml` - Namespace configuration
- `k8s/secrets.yml` - Kubernetes secrets
- `k8s/deployment.yml` - Main deployment configuration
- `k8s/service.yml` - Service configuration
- `k8s/ingress.yml` - Ingress configuration

## CI/CD Pipeline

### GitHub Actions
The CI/CD pipeline is configured in `.github/workflows/ci-cd.yml` and includes:

1. **Code Quality**
   - Linting and type checking
   - Unit and integration tests
   - Build verification

2. **Security Scanning**
   - Dependency vulnerability scanning
   - Container image scanning with Trivy

3. **Build and Deploy**
   - Multi-arch Docker image building
   - Automated deployment to staging/production
   - Health checks and smoke tests

4. **Monitoring**
   - Performance testing
   - Deployment notifications

### Pipeline Triggers
- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Testing and validation

## Monitoring and Observability

### Prometheus Metrics
The application exposes metrics at `/api/metrics`:

```bash
# Access metrics
curl http://localhost:3000/api/metrics

# View in Prometheus
# http://localhost:9090
```

### Grafana Dashboard
Pre-configured dashboards are available:

```bash
# Access Grafana
# http://localhost:3001
# Username: admin
# Password: admin
```

### Health Checks
```bash
# Application health
curl http://localhost:3000/health

# Database health
curl http://localhost:3000/api/health/db

# Redis health
curl http://localhost:3000/api/health/redis
```

### Logging
```bash
# View application logs
docker-compose logs -f app

# View system logs
docker-compose logs -f

# Kubernetes logs
kubectl logs -f deployment/invoice-app
```

## Security

### SSL/TLS Configuration
The Nginx configuration includes:
- Automatic HTTP to HTTPS redirect
- Modern SSL protocols and ciphers
- HSTS and security headers

### Rate Limiting
- API endpoints: 10 requests/second
- Authentication endpoints: 5 requests/minute
- Global rate limiting with Nginx

### Container Security
- Non-root user in containers
- Minimal base images (Alpine)
- Security scanning in CI/CD

### Secrets Management
- Environment variables for configuration
- Kubernetes secrets for sensitive data
- Docker secrets for swarm deployments

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env

# Check database connection
docker-compose exec app npm run db:check
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Check connection string
docker-compose exec app npm run db:test

# Reset database
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS invoicedb; CREATE DATABASE invoicedb;"
```

#### High Memory Usage
```bash
# Check container resources
docker stats

# Scale horizontally
docker-compose up -d --scale app=3

# Check Kubernetes resource limits
kubectl describe pod <pod-name>
```

#### Deployment Failures
```bash
# Check deployment status
kubectl rollout status deployment/invoice-app

# View deployment events
kubectl describe deployment invoice-app

# Rollback
kubectl rollout undo deployment/invoice-app
```

### Performance Optimization

#### Database Optimization
```bash
# Run database migrations
npm run db:migrate

# Create indexes
npm run db:index

# Analyze query performance
npm run db:analyze
```

#### Caching
```bash
# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# Warm up cache
npm run cache:warm
```

#### Load Testing
```bash
# Run performance tests
npm run test:performance

# Generate load with k6
k6 run performance-test.js
```

## Maintenance

### Backups
```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres invoicedb > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres invoicedb < backup.sql

# Automated backups
./scripts/backup.sh
```

### Updates
```bash
# Update dependencies
npm update

# Rebuild and redeploy
./scripts/deploy.sh deploy production

# Zero-downtime deployment
kubectl set image deployment/invoice-app app=$IMAGE_NAME:$VERSION
```

### Scaling
```bash
# Horizontal scaling
kubectl scale deployment invoice-app --replicas=5

# Vertical scaling
kubectl patch deployment invoice-app -p '{"spec":{"template":{"spec":{"containers":[{"name":"app","resources":{"limits":{"cpu":"500m","memory":"1Gi"}}}]}}}}'
```

## Support

For additional support:
1. Check the application logs
2. Review the troubleshooting section
3. Check the GitHub issues
4. Contact the DevOps team

## Contributing

When contributing to the deployment configuration:
1. Test changes in a development environment first
2. Update documentation
3. Follow the existing code style
4. Add tests for new features
