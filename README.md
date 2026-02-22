# Cloud Native Ops Portal

A full-stack website starter by **Shresh** focused on DevOps, FinOps, MLOps, SRE, and Cybersecurity.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Atlas Free Tier compatible)
- Containers: Docker + Docker Compose
- Orchestration: Kubernetes (GKE-ready manifests)
- Observability: Prometheus + Grafana

## Quick Start (Local)

### 1) Run with Docker Compose
```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (admin/admin)

### 2) Environment Variables
Copy and adjust:
```bash
cp backend/.env.example backend/.env
```

For MongoDB Atlas in local/dev, replace `MONGO_URI` in `backend/.env`.

## API Endpoints
- `GET /api/health`
- `GET /api/articles`
- `POST /api/contact`
- `GET /metrics`

## Kubernetes Deployment (GKE)
1. Build and push images to Artifact Registry.
2. Create namespace and secret:
```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/secret-template.yaml
```
3. Apply workloads:
```bash
kubectl apply -f infra/k8s/backend.yaml
kubectl apply -f infra/k8s/frontend.yaml
kubectl apply -f infra/k8s/ingress.yaml
```

## Notes
- Production setup should use MongoDB Atlas and managed secrets (GCP Secret Manager).
- Replace placeholder AI image URLs in frontend with your generated assets.
