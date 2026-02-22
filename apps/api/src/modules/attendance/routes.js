const express = require('express');
const { z } = require('zod');
const { query } = require('../../config/db');
const { requireAuth } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant');
const { requirePermission } = require('../../middleware/rbac');
const { withAudit } = require('../../middleware/audit');

const router = express.Router();

const checkInSchema = z.object({
  employee_id: z.string().uuid(),
  check_in_at: z.string(),
  source: z.enum(['manual', 'biometric', 'remote']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  geofence_label: z.string().optional()
});

router.get('/', requireAuth, requireTenant, requirePermission('attendance:read'), async (req, res) => {
  const result = await query(
    `SELECT id, employee_id, check_in_at, check_out_at, source, latitude, longitude, geofence_label
     FROM attendance_logs
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [req.tenantId]
  );
  return res.json(result.rows);
});

router.post(
  '/check-in',
  requireAuth,
  requireTenant,
  requirePermission('attendance:write'),
  withAudit('attendance.checkin', 'attendance_log'),
  async (req, res) => {
    const parsed = checkInSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const data = parsed.data;
    const result = await query(
      `INSERT INTO attendance_logs (tenant_id, employee_id, check_in_at, source, latitude, longitude, geofence_label)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, employee_id, check_in_at, source, latitude, longitude, geofence_label`,
      [
        req.tenantId,
        data.employee_id,
        data.check_in_at,
        data.source,
        data.latitude || null,
        data.longitude || null,
        data.geofence_label || null
      ]
    );

    return res.status(201).json(result.rows[0]);
  }
);

router.post(
  '/check-out',
  requireAuth,
  requireTenant,
  requirePermission('attendance:write'),
  withAudit('attendance.checkout', 'attendance_log'),
  async (req, res) => {
    const schema = z.object({ attendance_id: z.string().uuid(), check_out_at: z.string() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const result = await query(
      `UPDATE attendance_logs
       SET check_out_at = $3
       WHERE tenant_id = $1 AND id = $2
       RETURNING id, employee_id, check_in_at, check_out_at, source`,
      [req.tenantId, parsed.data.attendance_id, parsed.data.check_out_at]
    );

    if (!result.rowCount) return res.status(404).json({ error: 'Attendance log not found' });
    return res.json(result.rows[0]);
  }
);

module.exports = router;
