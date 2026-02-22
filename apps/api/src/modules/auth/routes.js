const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { query } = require('../../config/db');
const {
  jwtAccessSecret,
  jwtRefreshSecret,
  accessTokenTtl,
  refreshTokenTtl,
  googleClientId,
  googleCallbackUrl
} = require('../../config/env');
const { requireAuth } = require('../../middleware/auth');

const router = express.Router();

function signTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    tenant_id: user.tenant_id,
    role: user.role_name,
    permissions: user.permissions || []
  };

  const accessToken = jwt.sign(payload, jwtAccessSecret, { expiresIn: accessTokenTtl });
  const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: refreshTokenTtl });

  return { accessToken, refreshToken };
}

router.post('/register', async (req, res) => {
  const schema = z.object({
    tenantName: z.string().min(2),
    companySlug: z.string().min(2),
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { tenantName, companySlug, fullName, email, password } = parsed.data;

  const client = await require('../../config/db').pool.connect();
  try {
    await client.query('BEGIN');

    const tenantResult = await client.query(
      'INSERT INTO tenants(name, company_slug) VALUES($1,$2) RETURNING id',
      [tenantName, companySlug]
    );
    const tenantId = tenantResult.rows[0].id;

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users(tenant_id, full_name, email, password_hash)
       VALUES($1,$2,$3,$4) RETURNING id, tenant_id, email`,
      [tenantId, fullName, email.toLowerCase(), passwordHash]
    );

    await client.query(
      'INSERT INTO roles(tenant_id, name, is_system) VALUES($1,$2,true) ON CONFLICT DO NOTHING',
      [tenantId, 'Admin']
    );

    await client.query(
      'INSERT INTO role_permissions(role_id, permission_key) SELECT r.id, $2 FROM roles r WHERE r.tenant_id=$1 AND r.name=$3 ON CONFLICT DO NOTHING',
      [tenantId, '*', 'Admin']
    );

    await client.query(
      `INSERT INTO user_roles(tenant_id, user_id, role_id)
       SELECT $1, $2, r.id FROM roles r WHERE r.tenant_id=$1 AND r.name='Admin'`,
      [tenantId, userResult.rows[0].id]
    );

    await client.query('COMMIT');

    const tokens = signTokens({
      ...userResult.rows[0],
      role_name: 'Admin',
      permissions: ['*']
    });

    return res.status(201).json({
      ...tokens,
      user: { ...userResult.rows[0], role: 'Admin' }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.post('/login', async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  const userResult = await query(
    `SELECT u.id, u.tenant_id, u.email, u.full_name, u.password_hash,
            COALESCE(MAX(r.name), 'Employee') AS role_name,
            COALESCE(array_agg(rp.permission_key) FILTER (WHERE rp.permission_key IS NOT NULL), ARRAY[]::text[]) AS permissions
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles r ON r.id = ur.role_id
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     WHERE u.email = $1 AND u.is_active = true
     GROUP BY u.id`,
    [email.toLowerCase()]
  );

  if (!userResult.rowCount) return res.status(401).json({ error: 'Invalid credentials' });

  const user = userResult.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const tokens = signTokens(user);
  return res.json({
    ...tokens,
    user: {
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      full_name: user.full_name,
      role: user.role_name,
      permissions: user.permissions
    }
  });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

  try {
    const payload = jwt.verify(refreshToken, jwtRefreshSecret);
    const accessToken = jwt.sign(payload, jwtAccessSecret, { expiresIn: accessTokenTtl });
    return res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

router.get('/google/start', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    googleClientId
  )}&redirect_uri=${encodeURIComponent(googleCallbackUrl)}&response_type=code&scope=openid%20email%20profile`;
  return res.json({ authUrl: url });
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });
  return res.json({
    message: 'OAuth callback received. Exchange code + provision tenant/user in production implementation.'
  });
});

module.exports = router;
