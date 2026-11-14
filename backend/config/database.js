const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mariadb = require('mariadb');

// Own database, own credentials - written once by mff-core's install/update
// flow at ../../.env (this module's root, sibling to module.manifest.json).
// dotenv.parse (not dotenv.config) is required here: mff-core's own backend
// already calls dotenv.config() for its own .env at startup, which never
// overwrites a key already in process.env - a second dotenv.config() call
// for this module's .env would silently be a no-op if any variable name
// collided with core's, handing this module core's own credentials instead
// of its own. dotenv.parse() into a local object makes that structurally
// impossible, which is also why these variables are named MODULE_DB_* and
// not bare DB_* - never reuse core's exact names here, even by accident.
const envPath = path.join(__dirname, '..', '..', '.env');

// backend/index.js shadows coreApi.pool with this file's pool unconditionally
// (see docs/MFF-Core_module-core-api.md) - real install or dev harness, it doesn't check which.
// A real install always has envPath by the time this loads. The dev harness
// never does (there's no install step - see docs/MFF-Core_module-database-provisioning.md), so without this
// fallback every DB-touching route 500s under `npm run dev`, violating this
// repo's own "must work with zero mff-core checkout present" rule. Falls back
// to the dev harness's own dev/.env.dev (DB_* names, not MODULE_DB_*) only
// when the real one is absent - never the other way around.
const devEnvPath = path.join(__dirname, '..', '..', 'dev', '.env.dev');

function loadEnv() {
  if (fs.existsSync(envPath)) return dotenv.parse(fs.readFileSync(envPath));
  if (fs.existsSync(devEnvPath)) {
    const devEnv = dotenv.parse(fs.readFileSync(devEnvPath));
    return {
      MODULE_DB_HOST: devEnv.DB_HOST,
      MODULE_DB_USER: devEnv.DB_USER,
      MODULE_DB_PASSWORD: devEnv.DB_PASSWORD,
      MODULE_DB_NAME: devEnv.DB_NAME
    };
  }
  return {};
}
const env = loadEnv();

module.exports = mariadb.createPool({
  host: env.MODULE_DB_HOST || '127.0.0.1',
  user: env.MODULE_DB_USER,
  password: env.MODULE_DB_PASSWORD,
  database: env.MODULE_DB_NAME,
  connectionLimit: Number(env.MODULE_DB_CONNECTION_LIMIT) || 5,
  bigIntAsNumber: true,
  insertIdAsNumber: true
});
