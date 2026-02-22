# System Architecture

```mermaid
flowchart LR
  UI[React Web App] --> GW[Express API]
  GW --> AUTH[Auth Module]
  GW --> EMP[Employee Module]
  GW --> ATT[Attendance Module]
  GW --> AUD[Audit Module]
  GW --> RBAC[RBAC + Tenant Guards]

  AUTH --> PG[(PostgreSQL)]
  EMP --> PG
  ATT --> PG
  AUD --> PG

  GW --> S3[S3 Compatible Storage]
  GW --> WH[Webhook Dispatcher]
  GW --> NOTIF[Email/Slack Worker]
```

## SaaS Model
- Multi-tenant by `tenant_id` in all domain tables.
- Role-permission matrix with custom role support.
- API-first endpoints with JWT access tokens.

## Security Controls
- JWT access + refresh flow.
- Per-route permission middleware.
- Audit logs on write operations.
- OAuth Google flow endpoints ready.
