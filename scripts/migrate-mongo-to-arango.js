require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.production') });
const mongoose = require('mongoose');
const dbArango = require('../config/arango');
const collectionName = process.env.ARANGO_COLLECTION || 'blogposts';
const arangoCollection = dbArango.collection(collectionName);

// Use existing Mongoose Blog model
const Blog = require('../models/Blog');

async function migrate() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI missing in env');

    console.log('Connecting to MongoDB for migration...');

    // Try to parse credentials from the URI and pass via options to avoid percent-encoding issues
    let connectOpts = { useNewUrlParser: true, useUnifiedTopology: true };
    try {
      const match = mongoUri.match(/^mongodb:\/\/([^:]+):([^@]+)@(.+)$/);
      if (match) {
        const user = decodeURIComponent(match[1]);
        const pass = decodeURIComponent(match[2]);
        // Build URI without creds
        const uriNoCreds = 'mongodb://' + match[3];
        connectOpts.auth = { user, password: pass };
        // preserve options in query string if present
        await mongoose.connect(uriNoCreds, connectOpts);
      } else {
        // fallback to raw URI
        await mongoose.connect(mongoUri, connectOpts);
      }
    } catch (connErr) {
      console.error('Migration error (connecting):', connErr);
      throw connErr;
    }
    console.log('Connected to MongoDB');

    // ensure target collection exists
    const exists = await arangoCollection.exists();
    if (!exists) {
      console.log(`Arango collection ${collectionName} missing -> creating...`);
      await dbArango.createCollection(collectionName);
    }

    const docs = await Blog.find({}).lean().exec();
    console.log(`Found ${docs.length} documents in Mongo; starting migration...`);
    let count = 0;
    for (const d of docs) {
      const key = String(d._id);
      const doc = Object.assign({}, d);
      doc._key = key;
      delete doc._id;
      delete doc.__v;
      doc.likes = doc.likes || 0;
      doc.comments = doc.comments || [];
      doc.likedBy = doc.likedBy || [];
      doc.createdAt = doc.createdAt || new Date();
      doc.updatedAt = doc.updatedAt || new Date();

      try {
        await arangoCollection.save(doc, { overwrite: true });
        count++;
      } catch (err) {
        console.error('Failed saving doc key=', key, err.message);
      }
    }
    console.log(`Migration complete. Migrated ${count} documents.`);
    await mongoose.disconnect();
    return { migrated: count };
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { migrate };
