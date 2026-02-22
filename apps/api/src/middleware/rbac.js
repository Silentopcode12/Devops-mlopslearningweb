function requirePermission(permission) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];
    if (permissions.includes(permission) || permissions.includes('*')) {
      return next();
    }
    return res.status(403).json({ error: 'Insufficient permission', permission });
  };
}

module.exports = { requirePermission };
