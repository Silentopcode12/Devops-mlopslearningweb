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
  gross_pay: z.number(),
  deductions: z.number(),
  period_label: z.string().min(3)
});

router.get('/', requireAuth, requireTenant, requirePermission('payroll:read'), async (req, res) => {
  const result = await query(
    `SELECT p.id, e.employee_code, e.full_name, p.gross_pay, p.deductions, p.net_pay, pr.period_label
     FROM payslips p
     JOIN employees e ON e.id = p.employee_id
     LEFT JOIN payroll_runs pr ON pr.id = p.payroll_run_id
     WHERE p.tenant_id = $1
     ORDER BY p.created_at DESC`,
    [req.tenantId]
  );
  return res.json(result.rows);
});

router.post('/', requireAuth, requireTenant, requirePermission('payroll:write'), withAudit('payroll.created', 'payslip'), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const data = parsed.data;
  let employeeId = data.employee_id;
  if (!employeeId && data.employee_code) {
    const employeeResult = await query(
      'SELECT id FROM employees WHERE tenant_id = $1 AND employee_code = $2',
      [req.tenantId, data.employee_code]
    );
    if (!employeeResult.rowCount) return res.status(404).json({ error: 'Employee not found' });
    employeeId = employeeResult.rows[0].id;
  }

  const runResult = await query(
    `INSERT INTO payroll_runs (tenant_id, period_label, status, created_by)
     VALUES($1,$2,'COMPLETED',$3)
     RETURNING id`,
    [req.tenantId, data.period_label, req.user.id]
  );

  const netPay = Number(data.gross_pay) - Number(data.deductions);
  const result = await query(
    `INSERT INTO payslips (tenant_id, employee_id, payroll_run_id, gross_pay, deductions, net_pay)
     VALUES($1,$2,$3,$4,$5,$6)
     RETURNING id, employee_id, gross_pay, deductions, net_pay`,
    [req.tenantId, employeeId, runResult.rows[0].id, data.gross_pay, data.deductions, netPay]
  );

  return res.status(201).json(result.rows[0]);
});

module.exports = router;
