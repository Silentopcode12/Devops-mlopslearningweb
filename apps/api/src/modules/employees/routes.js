const express = require('express');
const { z } = require('zod');
const { query } = require('../../config/db');
const { requireAuth } = require('../../middleware/auth');
const { requireTenant } = require('../../middleware/tenant');
const { requirePermission } = require('../../middleware/rbac');
const { withAudit } = require('../../middleware/audit');

const router = express.Router();

const createSchema = z.object({
  employee_code: z.string().min(2),
  full_name: z.string().min(2),
  email: z.string().email(),
  department: z.string().min(2),
  job_title: z.string().min(2),
  employment_type: z.enum(['Full-time', 'Contract', 'Intern']),
  joining_date: z.string()
});

router.get('/', requireAuth, requireTenant, requirePermission('employee:read'), async (req, res) => {
  const result = await query(
    `SELECT id, employee_code, full_name, email, department, job_title, employment_type, joining_date
     FROM employees WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [req.tenantId]
  );
  res.json(result.rows);
});

router.post(
  '/',
  requireAuth,
  requireTenant,
  requirePermission('employee:write'),
  withAudit('employee.created', 'employee'),
  async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const data = parsed.data;
    const result = await query(
      `INSERT INTO employees (tenant_id, employee_code, full_name, email, department, job_title, employment_type, joining_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, employee_code, full_name, email, department, job_title, employment_type, joining_date`,
      [
        req.tenantId,
        data.employee_code,
        data.full_name,
        data.email.toLowerCase(),
        data.department,
        data.job_title,
        data.employment_type,
        data.joining_date
      ]
    );

    return res.status(201).json(result.rows[0]);
  }
);

router.patch('/:id', requireAuth, requireTenant, requirePermission('employee:write'), async (req, res) => {
  const allowed = ['full_name', 'department', 'job_title', 'employment_type'];
  const updates = [];
  const values = [req.tenantId, req.params.id];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      values.push(req.body[field]);
      updates.push(`${field} = $${values.length}`);
    }
  });

  if (!updates.length) return res.status(400).json({ error: 'No valid update fields' });

  const sql = `UPDATE employees SET ${updates.join(', ')} WHERE tenant_id = $1 AND id = $2 RETURNING *`;
  const result = await query(sql, values);

  if (!result.rowCount) return res.status(404).json({ error: 'Employee not found' });
  return res.json(result.rows[0]);
});

module.exports = router;
