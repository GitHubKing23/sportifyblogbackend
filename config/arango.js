const { Database } = require('arangojs');
const dotenv = require('dotenv');
const path = require('path');

// Load production env explicitly to match server behavior
dotenv.config({ path: path.resolve(__dirname, '..', '.env.production') });

const url = process.env.ARANGO_URL || 'http://127.0.0.1:8529';
const dbName = process.env.ARANGO_DB || 'SportifyBlogs';
const user = process.env.ARANGO_USER || '';
const pass = process.env.ARANGO_PASS || '';

// Build options, prefer passing basic auth in constructor if available
const dbOptions = { url };
if (user && pass) {
  dbOptions.auth = { username: user, password: pass };
}

// Create a top-level Database instance and then return the specific database handle.
const systemDb = new Database(dbOptions);
let db;
try {
  // Prefer documented API to get a database handle
  if (typeof systemDb.database === 'function') {
    db = systemDb.database(dbName);
  } else if (typeof systemDb.useDatabase === 'function') {
    // Older API: mutate the instance
    systemDb.useDatabase(dbName);
    db = systemDb;
  } else {
    // Fallback: use the instance directly and hope it targets the provided DB
    db = systemDb;
  }
} catch (err) {
  // don't crash at import time; allow callers to handle connect errors
  console.error('ArangoDB init error:', err.message || err);
  db = systemDb;
}

module.exports = db;
