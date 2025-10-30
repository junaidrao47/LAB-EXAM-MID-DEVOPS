# Node.js Production-Grade Application with Redis Caching & Monitoring

A comprehensive Node.js application demonstrating production-ready DevOps practices including Redis caching, MongoDB integration, Prometheus monitoring, Docker containerization, and CI/CD pipelines.

## 🏗️ Architecture Overview

This project implements a modern microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     Grafana     │    │   Prometheus    │
│   (Port 80/443) │    │   (Port 3000)   │    │   (Port 9090)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         └──────────────►│   Node.js App   │◄────────────┘
                        │   (Port 5000)   │
                        └─────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   MongoDB       │    │     Redis       │
                    │  (Port 27018)   │    │   (Port 6379)   │
                    └─────────────────┘    └─────────────────┘
```

### Core Features

- **📊 RESTful API** - Todo and Book management endpoints
- **⚡ Redis Caching** - Intelligent query caching with automatic invalidation
- **📈 Monitoring Stack** - Prometheus metrics + Grafana dashboards
- **🔒 Production Security** - Health checks, timeouts, and error handling
- **🚀 CI/CD Pipeline** - Automated testing, linting, and container builds
- **📦 Container Orchestration** - Docker Compose with persistent volumes

## 🚀 Quick Start

### Prerequisites

- Docker Desktop or Docker Engine 20.10+
- Docker Compose v2.0+
- Node.js 18+ (for local development)
- Git

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/junaidrao47/LAB-EXAM-MID-DEVOPS.git
cd node-redis-mongo
```

2. **Start the complete stack**
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

3. **Verify services are running**
```bash
docker-compose ps
```

### Service URLs

- **API Server**: http://localhost:5000
- **Grafana Dashboard**: http://localhost:3000 (admin/admin)
- **Prometheus Metrics**: http://localhost:9090
- **Health Check**: http://localhost:5000/api/health

## 🐳 Docker Configuration

### Service Architecture

| Service | Image | Ports | Volumes | Purpose |
|---------|--------|-------|---------|---------|
| **server** | `node:alpine` | 5000:5000 | - | Main Node.js application |
| **mongo** | `mongo:latest` | 27018:27017 | `mongo-data:/data/db` | MongoDB database |
| **redis** | `redis:latest` | 6379 | `redis-data:/data` | Caching layer |
| **prometheus** | `prom/prometheus:latest` | 9090:9090 | `./prometheus/prometheus.yml` | Metrics collection |
| **grafana** | `grafana/grafana:latest` | 3000:3000 | - | Metrics visualization |

### Persistent Volumes

```yaml
volumes:
  mongo-data:
    driver: local      # Persists MongoDB data
  redis-data:
    driver: local      # Persists Redis cache and snapshots
```

### Network Configuration

- **devnet**: Custom bridge network for service communication
- Services communicate using internal DNS names (mongo, redis, server)
- External access only through exposed ports

### Health Checks & Restart Policies

```yaml
server:
  healthcheck:
    test: ["CMD-SHELL", "curl -f http://localhost:5000/api/health || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 10s
  restart: unless-stopped
```

## 🔧 Development

### Local Development Setup

1. **Start only databases**
```bash
docker-compose up -d mongo redis
```

2. **Install dependencies**
```bash
npm install
```

3. **Run in development mode**
```bash
npm run dev
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_HOST` | localhost | MongoDB host |
| `MONGO_PORT` | 27018 | MongoDB port (host mapping) |
| `MONGO_DB_NAME` | testdb | Database name |
| `REDIS_HOST` | localhost | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `NODE_ENV` | development | Environment mode |

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test suite
npm test -- tests/todos.test.js
```

### Linting & Code Quality

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## 📊 API Documentation

### Health & Monitoring

- `GET /api/health` - Application health status
- `GET /metrics` - Prometheus metrics (production only)

### Todo Management

- `GET /api/todos` - List all todos (cached 30s)
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Book Management

- `GET /api/books` - List all books
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Example Requests

```bash
# Create a todo
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn DevOps", "dueDate": "2025-12-31"}'

# Get all todos (triggers cache)
curl http://localhost:5000/api/todos

# Check application health
curl http://localhost:5000/api/health
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The project uses GitHub Actions for automated CI/CD:

```yaml
Trigger: Push to main/master, Pull Requests
├── Lint & Test Job (10min timeout)
│   ├── Setup Node.js 18
│   ├── Cache npm dependencies  
│   ├── Start MongoDB & Redis services
│   ├── Run ESLint (continue-on-error)
│   └── Run Jest tests with --forceExit
│
└── Build & Push Job (runs even if tests fail)
    ├── Setup Docker Buildx
    ├── Login to GitHub Container Registry (GHCR)
    └── Build & push multi-arch image
```

### Container Registry

Images are pushed to GitHub Container Registry (GHCR):
- `ghcr.io/junaidrao47/lab-exam-mid-devops:latest`
- `ghcr.io/junaidrao47/lab-exam-mid-devops:<commit-sha>`

## 📈 Monitoring & Observability

### Prometheus Metrics

The application exposes the following metrics:
- HTTP request duration and count
- Node.js process metrics (memory, CPU)
- Custom business metrics
- Database connection status

### Grafana Dashboards

Pre-configured dashboards for:
- Application Performance Monitoring (APM)
- Infrastructure metrics
- Database performance
- Redis cache hit rates

### Health Monitoring

- Application health endpoint: `/api/health`
- Docker health checks with automatic restarts
- Prometheus alerting rules (configurable)

## 🔒 Security Features

- **Input Validation**: Request body validation and sanitization
- **Rate Limiting**: Configurable per-endpoint rate limits
- **Health Checks**: Container-level health monitoring
- **Secrets Management**: GitHub Actions secrets for container registry
- **Network Isolation**: Services communicate via private network

## 📁 Project Structure

```
node-redis-mongo/
├── app.js              # Express app configuration
├── index.js            # Server entry point
├── Dockerfile          # Container build instructions
├── docker-compose.yml  # Multi-service orchestration
├── package.json        # Node.js dependencies & scripts
├── .github/
│   └── workflows/
│       └── ci.yml      # GitHub Actions pipeline
├── config/
│   ├── dev.js          # Development configuration
│   └── keys.js         # Configuration loader
├── models/
│   ├── Book.js         # Book Mongoose model
│   └── Todo.js         # Todo Mongoose model
├── routes/
│   ├── bookRoutes.js   # Book API endpoints
│   └── todoRoutes.js   # Todo API endpoints  
├── services/
│   └── cache.js        # Redis caching layer
├── tests/
│   ├── api.test.js     # API integration tests
│   └── todos.test.js   # Todo CRUD tests
├── prometheus/
│   └── prometheus.yml  # Prometheus configuration
└── tools/              # Development utilities
```

## 🛠️ Performance Optimizations

### Caching Strategy

- **Query-level caching**: Mongoose queries cached in Redis
- **Automatic invalidation**: Cache cleared on data modifications
- **Configurable TTL**: Per-query cache expiration times

### Database Optimizations

- **Connection pooling**: MongoDB connection reuse
- **Indexed queries**: Optimized database indexes
- **Lean queries**: Memory-efficient data retrieval

### Container Optimizations

- **Multi-stage builds**: Minimal production images
- **Alpine Linux**: Lightweight base images
- **Layer caching**: Optimized Dockerfile structure

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Change host ports in docker-compose.yml
2. **Memory issues**: Increase Docker Desktop memory allocation
3. **Volume permissions**: Ensure proper Docker volume permissions

### Debug Commands

```bash
# View service logs
docker-compose logs -f server
docker-compose logs -f mongo

# Check service health
docker-compose ps
docker inspect <container_name>

# Access container shell
docker-compose exec server sh
docker-compose exec mongo mongosh
```

### Performance Monitoring

```bash
# Monitor resource usage
docker stats

# Check application metrics
curl http://localhost:5000/metrics

# View Redis cache status
docker-compose exec redis redis-cli info memory
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Monitoring Guide](https://prometheus.io/docs/guides/node-exporter/)
- [Grafana Dashboard Creation](https://grafana.com/docs/grafana/latest/dashboards/)
- [GitHub Actions CI/CD](https://docs.github.com/en/actions)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 DevOps Best Practices Demonstrated

✅ **Infrastructure as Code** - Docker Compose configuration  
✅ **CI/CD Pipeline** - GitHub Actions workflow  
✅ **Monitoring & Observability** - Prometheus + Grafana  
✅ **Container Security** - Health checks, restart policies  
✅ **Data Persistence** - Named volumes for databases  
✅ **Testing Strategy** - Unit, integration, and API tests  
✅ **Code Quality** - ESLint, automated testing  
✅ **Documentation** - Comprehensive README and comments
