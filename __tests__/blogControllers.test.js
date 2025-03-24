const request = require("supertest");
const app = require("../server"); // ✅ Import Express App
const Blog = require("../models/Blog");
const mongoose = require("mongoose");

describe("📝 Blog API Tests", () => {
    let blogId;

    // ✅ Ensure Clean Database Before Each Test
    beforeEach(async () => {
        await Blog.deleteMany({});
    });

    // ✅ Test Creating a Blog
    test("🔹 Create a new blog", async () => {
        const res = await request(app)
            .post("/api/blogs")
            .send({
                title: "Test Blog",
                category: "NBA",
                author: "Test Author",
                featured: false,
                content: "This is a test blog content.",
            });

        expect(res.status).toBe(201);
        expect(res.body.blog).toHaveProperty("_id");
        expect(res.body.blog.title).toBe("Test Blog");

        blogId = res.body.blog._id; // Save ID for later tests
    });

    // ✅ Test Fetching All Blogs
    test("🔹 Fetch all blogs", async () => {
        const res = await request(app).get("/api/blogs");

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.blogs)).toBe(true);
    });

    // ✅ Test Fetching a Single Blog
    test("🔹 Fetch a single blog by ID", async () => {
        const res = await request(app).get(`/api/blogs/${blogId}`);

        expect(res.status).toBe(200);
        expect(res.body.blog._id).toBe(blogId);
    });

    // ✅ Test Updating a Blog
    test("🔹 Update a blog", async () => {
        const res = await request(app)
            .put(`/api/blogs/${blogId}`)
            .send({ title: "Updated Test Blog", category: "NFL" });

        expect(res.status).toBe(200);
        expect(res.body.blog.title).toBe("Updated Test Blog");
    });

    // ✅ Test Toggling Feature Status
    test("🔹 Toggle Featured Status", async () => {
        const res = await request(app).patch(`/api/blogs/${blogId}/feature`);

        expect(res.status).toBe(200);
        expect(res.body.blog).toHaveProperty("featured");
    });

    // ✅ Test Deleting a Blog
    test("🔹 Delete a blog", async () => {
        const res = await request(app).delete(`/api/blogs/${blogId}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Blog deleted successfully");
    });

    // ✅ Test Fetching a Non-Existent Blog
    test("🔹 Fetch non-existent blog should return 404", async () => {
        const res = await request(app).get(`/api/blogs/${blogId}`);
        expect(res.status).toBe(404);
    });
});
