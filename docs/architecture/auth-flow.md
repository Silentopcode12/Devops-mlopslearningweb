# Auth Flow

1. User logs in with email/password at `/api/v1/auth/login`.
2. API verifies hash and loads tenant + roles + permissions.
3. API returns access and refresh JWT.
4. Frontend uses access token in `Authorization: Bearer ...`.
5. Protected routes enforce:
   - `requireAuth`
   - `requireTenant`
   - `requirePermission`
6. Refresh endpoint issues new access token.
7. Google OAuth starts at `/api/v1/auth/google/start`.
