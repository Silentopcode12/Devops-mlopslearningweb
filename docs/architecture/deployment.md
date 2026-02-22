# Deployment Steps (Docker + Cloud Ready)

## Local
1. `docker compose up --build -d`
2. API auto-runs migration and seed at startup.
3. Open:
   - Web: `http://localhost:5173`
   - API Docs: `http://localhost:8080/api-docs`

## Cloud (recommended)
1. Build images and push to registry.
2. Provision managed Postgres (Cloud SQL/RDS).
3. Inject env vars via secret manager.
4. Run migration job before deploying API rollout.
5. Deploy API and web behind ingress/load balancer.
6. Enable TLS + WAF + rate limiting.
7. Configure S3 bucket + IAM least privilege.
8. Configure webhook/notification workers.
