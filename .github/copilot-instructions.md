# Copilot Instructions for Sportify Blog Backend

## Project Overview
- **Type:** Node.js/Express backend for a sports blog platform
- **Data Layer:** MongoDB via Mongoose, with a single main model: `Blog` (see `models/Blog.js`)
- **API:** RESTful endpoints for blog CRUD, category filtering, featured flag, and pagination (see `routes/blogRoutes.js`)
- **Uploads:** Static file serving for blog images via `/uploads` (see `server.js`)

## Key Architectural Patterns
- **Environment Management:**
  - Always loads `.env.production` in production, `.env.test` for tests (see `server.js`, `jest.setup.js`).
  - MongoDB URI is required; process exits if missing (except in test mode).
- **CORS:**
  - Strictly whitelisted origins; update `allowedOrigins` in `server.js` for new frontends.
- **Error Handling:**
  - Global error handler and 404 handler in `server.js`.
  - All controllers log errors with details and return structured JSON errors.
- **No Caching:**
  - All API responses set headers to prevent caching (see `disableCache` in controllers).
- **Testing:**
  - Uses Jest and Supertest. Test DB is wiped before each test. See `jest.setup.js` and `__tests__/blogControllers.test.js`.
  - Run tests with `npm test`.
- **Dev Workflow:**
  - Start dev server: `npm run dev` (nodemon)
  - Start prod server: `npm start`

## Project-Specific Conventions
- **Blog Model:**
  - Categories are strictly enumerated (NBA, NHL, NFL, MLB, Esports, Footy, Other).
  - Blog content is structured as an array of sections, each with optional images/captions.
  - All image/video URLs must be valid HTTP(S) or `/uploads/` paths.
  - MongoDB collection is explicitly named `created_blog_posts`.
  - **SEO Enhancements:**
    - Blogs support `metaTitle` (max 70 chars), `metaDescription` (max 160 chars), and `slug` (unique, kebab-case, for SEO-friendly URLs).
    - These fields are accepted and returned by all CRUD endpoints. Always provide them for new/updated blogs to improve discoverability.
- **API Design:**
  - `/api/blogs` for CRUD, `/api/blogs/featured`, `/api/blogs/category/:category`, `/api/blogs/paginated`, `/api/blogs/:id/feature` for toggling featured status.
  - Health check at `/api/health` returns DB status and timestamp.
- **Debugging:**
  - Extensive console logging for DB connections, route loading, and controller actions.

## Integration Points
- **Frontend:**
  - CORS allows only specific domains; update as needed.
- **Uploads:**
  - Images are served from `/uploads` directory; ensure this is writable and accessible.

## Example: Adding a New Blog Category
1. Add the new category to `CATEGORIES` in `models/Blog.js`.
2. Update any frontend logic to match.

## References
- Main entry: `server.js`
- DB config: `config/db.js`
- Blog model: `models/Blog.js`
- Blog routes: `routes/blogRoutes.js`
- Blog controllers: `controllers/blogController.js`
- Test setup: `jest.setup.js`, `__tests__/blogControllers.test.js`

---

**For AI agents:**
- Always follow the explicit patterns in this file and referenced code.
- When in doubt, prefer explicit logging and error handling as seen in controllers.
- Do not introduce new categories or fields without updating the schema and documentation.
- When creating or updating blogs, always handle the SEO fields (`metaTitle`, `metaDescription`, `slug`).
