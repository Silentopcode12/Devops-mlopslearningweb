const { query } = require('../config/db');

function withAudit(action, entityName) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        if (req.user?.id && req.tenantId) {
          await query(
            `INSERT INTO audit_logs (tenant_id, actor_user_id, action, entity_name, entity_id, metadata)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [req.tenantId, req.user.id, action, entityName, body?.id || null, JSON.stringify({ path: req.path })]
          );
        }
      } catch (error) {
        // Ignore audit insert failures to avoid user-facing outage.
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = { withAudit };
