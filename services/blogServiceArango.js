const db = require('../config/arango');
const { aql } = require('arangojs');

const collectionName = process.env.ARANGO_COLLECTION || 'blogposts';
const collection = db.collection(collectionName);

async function getAll() {
  const cursor = await db.query(aql`
    FOR b IN ${collection}
      SORT b.createdAt DESC
      RETURN b
  `);
  return cursor.all();
}

async function getByKey(key) {
  try {
    const doc = await collection.document(key);
    return doc;
  } catch (err) {
    if (err.code === 404) return null;
    throw err;
  }
}

async function getBySlug(slug) {
  const cursor = await db.query(aql`
    FOR b IN ${collection}
      FILTER b.slug == ${slug}
      LIMIT 1
      RETURN b
  `);
  return cursor.next();
}

async function getPaginated(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const cursor = await db.query(aql`
    FOR b IN ${collection}
      SORT b.createdAt DESC
      LIMIT ${skip}, ${limit}
      RETURN b
  `);
  const items = await cursor.all();
  // total count
  const countCursor = await db.query(aql`RETURN LENGTH(FOR b IN ${collection} RETURN 1)`);
  const total = (await countCursor.next()) || 0;
  return { items, total };
}

async function create(doc) {
  const now = new Date();
  const toSave = Object.assign({
    likes: 0,
    comments: [],
    likedBy: [],
    featured: !!doc.featured,
    isPublished: doc.isPublished !== undefined ? !!doc.isPublished : true,
    sections: doc.sections || [],
    createdAt: doc.createdAt || now,
    updatedAt: doc.updatedAt || now,
    authorId: doc.authorId || null,
    authorEmail: doc.authorEmail || null,
    authorName: doc.authorName || doc.author || 'Unknown Author'
  }, doc);
  const meta = await collection.save(toSave, { returnNew: true });
  return meta.new;
}

async function update(key, fields) {
  fields.updatedAt = new Date();
  try {
    const meta = await collection.update(key, fields, { returnNew: true });
    return meta.new;
  } catch (err) {
    if (err.code === 404) return null;
    throw err;
  }
}

async function remove(key) {
  try {
    await collection.remove(key);
    return true;
  } catch (err) {
    if (err.code === 404) return false;
    throw err;
  }
}

async function toggleFeatured(key) {
  const blog = await getByKey(key);
  if (!blog) return null;
  return update(key, { featured: !blog.featured });
}

async function like(key, userIdentifier) {
  if (!userIdentifier) throw new Error('user identifier required');
  const blog = await getByKey(key);
  if (!blog) throw new Error('Blog not found');
  const lower = String(userIdentifier).toLowerCase();
  const likedBy = Array.isArray(blog.likedBy) ? blog.likedBy.map(a => String(a).toLowerCase()) : [];
  if (likedBy.includes(lower)) return { alreadyLiked: true, likes: blog.likes || 0 };
  const newLikedBy = (blog.likedBy || []).concat([lower]);
  const newLikes = (blog.likes || 0) + 1;
  const meta = await collection.update(key, { likedBy: newLikedBy, likes: newLikes, updatedAt: new Date() }, { returnNew: true });
  return { alreadyLiked: false, likes: meta.new.likes };
}

async function addComment(key, user, text) {
  if (!text) throw new Error('Comment text required');
  const blog = await getByKey(key);
  if (!blog) throw new Error('Blog not found');
  const comment = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, user: user || 'Anonymous', text, date: new Date() };
  const newComments = (blog.comments || []).concat([comment]);
  const meta = await collection.update(key, { comments: newComments, updatedAt: new Date() }, { returnNew: true });
  return meta.new.comments;
}

async function getComments(key) {
  const blog = await getByKey(key);
  if (!blog) return [];
  return blog.comments || [];
}

async function getByCategory(category) {
  const cursor = await db.query(aql`
    FOR b IN ${collection}
      FILTER LOWER(b.category) == LOWER(${category})
      SORT b.createdAt DESC
      RETURN b
  `);
  return cursor.all();
}

async function getFeatured() {
  const cursor = await db.query(aql`
    FOR b IN ${collection}
      FILTER b.featured == true
      SORT b.createdAt DESC
      RETURN b
  `);
  return cursor.all();
}

module.exports = {
  getAll,
  getByKey,
  getBySlug,
  getPaginated,
  create,
  update,
  remove,
  toggleFeatured,
  like,
  addComment,
  getComments,
  getByCategory,
  getFeatured
};