-- This module's own tables. No migrations, ever - this file is the single
-- source of truth for this module's schema, edited directly (same rule as
-- mff-core's own App_backend/install/schema.sql). Every table MUST be
-- prefixed with module.manifest.json's tablePrefix ("xchem_" by default -
-- rename both together if you rename the module).
--
-- Imported by mff-core's own moduleDatabaseProvisioner.js, against this
-- module's own dedicated database (mff_module_<id>) created for it at
-- Install/Update time - see docs/coreApi.md's database section. For local
-- dev, dev/db/dev-setup.js imports this same file against a throwaway
-- <id>_dev database instead - a separate, non-interacting system.

-- Fragment-screening campaigns. Each belongs to one project, owned by the
-- Science module: project_id is Science's project id (another database, so no
-- FK). Who may see or change a campaign is decided by project membership
-- (coreApi.projects.access), never by this table. No route creates rows yet.
CREATE TABLE IF NOT EXISTS xchem_campaigns (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_project_id (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Backs PageAccessTab.js / pageAccessRoutes.js: which roles can see which of
-- this module's own tabs. A row's presence means that role has access to
-- that page_key - no row for a page means nobody but staff (who bypass this
-- check entirely via checkRole in pageAccessRoutes.js) can see it.
CREATE TABLE IF NOT EXISTS xchem_page_access (
  page_key VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  PRIMARY KEY (page_key, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
