const express = require('express');
const { z } = require('zod');
const { query } = require('../../config/db');
const { requireAuth } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant');
const { requirePermission } = require('../../middleware/rbac');
const { withAudit } = require('../../middleware/audit');

const router = express.Router();

const createSchema = z.object({
  employee_id: z.string().uuid().optional(),
  employee_code: z.string().min(2).optional(),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string().min(3)
});

router.get('/', requireAuth, requireTenant, requirePermission('leave:read'), async (req, res) => {
  const result = await query(
    `SELECT lr.id, e.employee_code, e.full_name, lr.start_date, lr.end_date, lr.reason, lr.status
     FROM leave_requests lr
     JOIN employees e ON e.id = lr.employee_id
     WHERE lr.tenant_id = $1
     ORDER BY lr.created_at DESC`,
    [req.tenantId]
  );
  return res.json(result.rows);
});

router.post('/', requireAuth, requireTenant, requirePermission('leave:write'), withAudit('leave.created', 'leave_request'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let employeeId = parsed.data.employee_id;
  if (!employeeId && parsed.data.employee_code) {
    const employeeResult = await query(
      'SELECT id FROM employees WHERE tenant_id = $1 AND employee_code = $2',
      [req.tenantId, parsed.data.employee_code]
    );
    if (!employeeResult.rowCount) return res.status(404).json({ error: 'Employee not found' });
    employeeId = employeeResult.rows[0].id;
  }

  const result = await query(
    `INSERT INTO leave_requests (tenant_id, employee_id, start_date, end_date, reason, status)
     VALUES ($1,$2,$3,$4,$5,'PENDING')
     RETURNING id, employee_id, start_date, end_date, reason, status`,
    [req.tenantId, employeeId, parsed.data.start_date, parsed.data.end_date, parsed.data.reason]
  );

  return res.status(201).json(result.rows[0]);
});

router.patch('/:id/approve', requireAuth, requireTenant, requirePermission('leave:approve'), withAudit('leave.approved', 'leave_request'), async (req, res) => {
  const result = await query(
    `UPDATE leave_requests
     SET status = 'APPROVED', approver_id = $3
     WHERE tenant_id = $1 AND id = $2
     RETURNING id, status`,
    [req.tenantId, req.params.id, req.user.id]
  );

  if (!result.rowCount) return res.status(404).json({ error: 'Leave request not found' });
  return res.json(result.rows[0]);
});

module.exports = router;
