# HRMS SaaS Starter (Multi-tenant)

Production-oriented HRMS foundation inspired by enterprise HR patterns.

## Stack
- Frontend: React + Tailwind (Vite)
- Backend: Node.js + Express (modular domain APIs)
- Database: PostgreSQL
- Auth: JWT + refresh token + Google OAuth endpoints (ready hooks)
- Storage: S3-compatible design hooks
- Notifications: webhook + notification table/event stubs

## Modules Included (Foundation)
- Auth + RBAC + multi-tenant guards
- Employee Management (CRUD)
- Attendance Tracking (check-in/out, geofence metadata)
- Audit Logs

## SaaS + Enterprise Design
- Tenant-aware data model (`tenant_id` scoped)
- Role model: Admin, HR Manager, Team Manager, Employee, Custom roles
- API-first with OpenAPI file
- GDPR hooks: data export/delete request tables and endpoints scaffold

## Run Locally
```bash
docker compose up --build -d
```

URLs:
- Web: http://localhost:5173
- API: http://localhost:8080
- API Docs: http://localhost:8080/api-docs

## Useful Commands
```bash
docker compose logs -f api
docker compose exec api npm run db:migrate
docker compose exec api npm run db:seed
```

## Folder Layout
- `apps/web` - React dashboard
- `apps/api` - Express API modules
- `packages/db` - SQL schema + seed data
- `docs` - architecture, ERD, API, auth flow, wireframes
- `infra/docker` - container references
