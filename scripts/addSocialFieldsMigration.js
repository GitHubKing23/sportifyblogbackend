require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.production') });
const mongoose = require('mongoose');
const Blog = require('../models/Blog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/blog-database';

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const res = await Blog.updateMany(
      { $or: [{ likes: { $exists: false } }, { comments: { $exists: false } }, { likedBy: { $exists: false } }] },
      { $set: { likes: 0, comments: [], likedBy: [] } }
    );

    console.log('Migration result:', res.nModified || res.modifiedCount || res);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  }
}

migrate();
