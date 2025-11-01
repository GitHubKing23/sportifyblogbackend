// Compatibility adapter: expose a minimal Mongoose-like static API
// backed by the Arango service. This prevents runtime crashes for any
// leftover code that still requires `models/Blog` while allowing the
// application to use ArangoDB.

const service = require('../services/blogServiceArango');
const db = require('../config/arango');

async function _countAll() {
  const cursor = await db.query(`RETURN LENGTH(FOR b IN ${serviceCollectionName() || 'blogposts'} RETURN 1)`);
  return (await cursor.next()) || 0;
}

function serviceCollectionName() {
  return process.env.ARANGO_COLLECTION || 'blogposts';
}

module.exports = {
  // find(filter) -> returns an array
  async find(filter = {}) {
    if (!filter || Object.keys(filter).length === 0) return service.getAll();
    if (filter.slug) {
      const r = await service.getBySlug(filter.slug);
      return r ? [r] : [];
    }
    if (filter._id || filter._key || filter.id) {
      const id = filter._id || filter._key || filter.id;
      const r = await service.getByKey(id);
      return r ? [r] : [];
    }
    if (filter.featured === true) return service.getFeatured();
    if (filter.category) return service.getByCategory(filter.category);
    // fallback to returning all
    return service.getAll();
  },

  // findOne(filter) -> single doc or null
  async findOne(filter = {}) {
    const arr = await this.find(filter);
    return arr && arr.length ? arr[0] : null;
  },

  // findById(id) -> doc or null
  async findById(id) {
    return service.getByKey(id);
  },

  // findByIdAndUpdate(id, update, opts) -> returns updated doc or null
  async findByIdAndUpdate(id, update, opts = {}) {
    return service.update(id, update);
  },

  // findByIdAndDelete(id) -> returns deleted doc (previous snapshot) or null
  async findByIdAndDelete(id) {
    const prev = await service.getByKey(id);
    if (!prev) return null;
    const ok = await service.remove(id);
    return ok ? prev : null;
  },

  // create(doc) -> returns created doc
  async create(doc) {
    return service.create(doc);
  },

  // countDocuments(filter) -> number
  async countDocuments(filter = {}) {
    // only support total count for now
    return _countAll();
  }
};

