# HRMS Microservices Platform

Production-style HRMS starter built with microservice architecture.

## Services
- `frontend` (React + Vite)
- `gateway` (API Gateway on port `8080`)
- `auth-service` (users, auth stubs)
- `employee-service` (employee records)
- `leave-service` (leave requests)
- `payroll-service` (payroll records)

Each domain service owns its own Mongo database.

## Architecture
- Frontend calls only the API Gateway.
- Gateway routes traffic to internal services.
- Services are independently deployable and independently scalable.

## Local Run
```bash
docker-compose up --build -d
```

App URLs:
- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:8080`

Health checks:
- `GET /health` on gateway
- `GET /health` on each service

## Service Endpoints via Gateway
- `POST /api/auth/register`
- `GET /api/auth/users`
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/leave`
- `POST /api/leave`
- `PATCH /api/leave/:id/approve`
- `GET /api/payroll`
- `POST /api/payroll`

## Kubernetes
Manifests are in `k8s/`.
- Create namespace and secrets first.
- Deploy databases, services, gateway, frontend, ingress.

## Next Recommended Steps
- Add JWT auth and RBAC.
- Add Kafka/RabbitMQ for async payroll events.
- Add Redis cache and rate limiting at gateway.
- Add CI/CD and security scanning.
