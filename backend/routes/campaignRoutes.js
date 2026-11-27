// Fragment-screening campaigns, always read within one project. Project
// membership is the access control: it is decided by core
// (coreApi.projects.access, which never throws and fails closed).
// See docs/MFF-Core_module-core-api.md, "Projects".
const express = require('express');

module.exports = function buildRouter(coreApi) {
  const router = express.Router();

  // GET /api/xchem/campaigns?project_id=N - campaigns of a project the user can read
  router.get('/campaigns', coreApi.authenticateToken, async (req, res) => {
    const raw = String(req.query.project_id || '');
    if (!/^[1-9]\d{0,17}$/.test(raw)) return res.status(400).json({ error: 'project_id is required' });
    const projectId = Number(raw);

    if (!coreApi.projects || !(await coreApi.projects.available())) {
      return res.status(503).json({ error: 'Projects are not available (is the Science module installed?)' });
    }
    const access = await coreApi.projects.access(req.user, projectId);
    // 404, not 403: a project the user cannot read must not be revealed.
    if (!access || access.can_read !== true) return res.status(404).json({ error: 'Project not found' });

    let conn;
    try {
      conn = await coreApi.pool.getConnection();
      const rows = await conn.query(
        'SELECT id, project_id, title, status, created_at FROM xchem_campaigns WHERE project_id = ? ORDER BY created_at DESC, id DESC',
        [projectId]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch campaigns', message: err.message });
    } finally {
      if (conn) conn.release();
    }
  });

  return router;
};
