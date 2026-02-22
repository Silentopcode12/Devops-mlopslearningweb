function requireTenant(req, res, next) {
  const tenantId = req.user?.tenant_id;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context missing' });
  }
  req.tenantId = tenantId;
  return next();
}

module.exports = { requireTenant };
