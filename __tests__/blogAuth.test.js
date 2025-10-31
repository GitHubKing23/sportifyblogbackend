const path = require('path');
// load env so process.env.JWT_SECRET and ADMIN_WALLET_ADDRESS match the server
require('dotenv').config({ path: path.resolve(__dirname, '../.env.production') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Blog = require('../models/Blog');

const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey';
const ADMIN_WALLET = (process.env.ADMIN_WALLET_ADDRESS || '0x3ff964e530ece8587da1b67d9a43de5d734ef0de').toLowerCase();

describe('Protected blog routes (admin wallet enforcement)', () => {
  let token;

  beforeAll(async () => {
    // sign a token with wallet address equal to admin using the same secret the server uses
    token = jwt.sign({ address: ADMIN_WALLET }, JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    try {
      await Blog.deleteMany({ title: 'Test CMS Post' });
    } catch (e) {}
  });

  test('allows creating a blog with valid admin token', async () => {
    const payload = {
      title: 'Test CMS Post',
      categories: ['Other'],            // use the project's expected fields
      content: [{ type: 'text', value: 'body' }],
      metaTitle: 'meta',
      metaDescription: 'desc',
      slug: 'test-cms-post'
    };

    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect('Content-Type', /json/);

    expect([200,201]).toContain(res.status);
    const created = res.body.blog || res.body;
    expect(created).toHaveProperty('title', payload.title);
  });

  test('forbids creating a blog with non-admin wallet', async () => {
    const badToken = jwt.sign({ address: '0xdeadbeef00000000000000000000000000000000' }, JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${badToken}`)
      .send({
        title: 'Should not create',
        categories: ['Other'],
        content: [{ type: 'text', value: 'x' }],
        slug: 'should-not-create'
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });
});
