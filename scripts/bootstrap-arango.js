require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const db = require('../config/arango'); // exports db instance
const collectionName = process.env.ARANGO_COLLECTION || 'blogposts';

async function bootstrap({ migrate = false } = {}) {
  try {
    console.log('Connected database:', db.name || process.env.ARANGO_DB || 'unknown');

    const collection = db.collection(collectionName);
    const exists = await collection.exists();
    if (!exists) {
      console.log(`Collection ${collectionName} missing -> creating...`);
      await db.createCollection(collectionName);
      console.log(`Collection ${collectionName} created`);
    } else {
      console.log(`Collection ${collectionName} exists`);
    }

    // ensure unique index on slug (if slug present)
    try {
      const col = db.collection(collectionName);
      // create persistent hash index on slug (unique)
      if (typeof col.createPersistentIndex === 'function') {
        await col.createPersistentIndex(['slug'], { unique: true });
        console.log('Ensured unique persistent index on slug');
      } else if (typeof col.createHashIndex === 'function') {
        await col.createHashIndex(['slug'], { unique: true });
        console.log('Ensured unique hash index on slug');
      }
    } catch (err) {
      // ignore if index already exists or driver doesn't support createPersistentIndex
      console.warn('Could not create persistent index on slug:', err.message);
    }

    if (migrate) {
      console.log('Migration flag detected -> running migration script');
      const { migrate: runMigrate } = require('./migrate-mongo-to-arango');
      await runMigrate();
    }

    return { created: !exists };
  } catch (err) {
    console.error('bootstrap-arango error:', err);
    throw err;
  }
}

// Allow running as CLI
if (require.main === module) {
  const migrateFlag = process.argv.includes('--migrate');
  bootstrap({ migrate: migrateFlag })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { bootstrap };