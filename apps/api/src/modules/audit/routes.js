const express = require('express');
const { query } = require('../../config/db');
const { requireAuth } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant');
const { requirePermission } = require('../../middleware/rbac');

const router = express.Router();

router.get('/', requireAuth, requireTenant, requirePermission('audit:read'), async (req, res) => {
  const result = await query(
    `SELECT id, action, entity_name, entity_id, metadata, created_at
     FROM audit_logs WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT 200`,
    [req.tenantId]
  );
  return res.json(result.rows);
});

module.exports = router;
