try {
  const db = require('../config/arango');
  console.log('Arango require ok. dbName:', db.name || db._name || process.env.ARANGO_DB);
} catch (err) {
  console.error('Require failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}
