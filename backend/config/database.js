// This module's own database pool. Core's provisioner creates the database at
// Install/Update and keeps the credentials in core's own configuration; a
// module gets them through coreApi.getModuleConfig(), never from a file of its
// own (docs/MFF-Core_module-core-api.md, "Database credentials also go through
// getModuleConfig() now").
const mariadb = require('mariadb');

module.exports = function createPool(config) {
  return mariadb.createPool({
    host: config.DB_HOST || '127.0.0.1',
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
    connectionLimit: Number(config.DB_CONNECTION_LIMIT) || 5,
    bigIntAsNumber: true,
    insertIdAsNumber: true
  });
};
