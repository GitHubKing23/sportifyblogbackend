const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.production') });
const db = require('../config/arango');

(async () => {
  try {
    const ver = await db.version();
    console.log('✅ ArangoDB version:', ver.version);

    // Print which database handle we're using (helps debug case-sensitivity / name issues)
    try {
      console.log('🔗 Connected database:', db.name || db._name || db._db || '(unknown)');
    } catch (e) {
      console.log('🔗 Connected database: (could not read name)');
    }

    const collectionName = process.env.ARANGO_COLLECTION || 'blogposts';
    const col = db.collection(collectionName);
    const exists = await col.exists();
    console.log(`🔎 Collection ${collectionName} exists:`, exists);
    process.exit(0);
  } catch (err) {
    console.error('❌ ArangoDB connection failed:', err.message || err);
    process.exit(1);
  }
})();
