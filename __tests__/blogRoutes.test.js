const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Blog = require("../models/Blog");

let blogId; // For update, feature, and delete tests

beforeAll(async () => {
    try {
        console.log("🔗 Connecting to test database...");
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to test database.");
        await Blog.deleteMany({}); // Clear test data before starting
    } catch (error) {
        console.error("❌ Failed to connect to test database:", error.message);
        process.exit(1); // Critical failure, exit Jest process
    }
});

afterAll(async () => {
    console.log("🛑 Closing test database connection...");
    await mongoose.connection.close();
    console.log("✅ Database connection closed.");
});

describe("Blog Routes", () => {

    test("Create a new blog with section images and captions", async () => {
        const newBlog = {
            title: "Test Blog with Images",
            category: "NBA",
            author: "Test Author",
            feature_image: "/uploads/blogs/feature-test-image.jpg",  // New main image
            sections: [
                {
                    heading: "Introduction",
                    content: "This is a test section with an image.",
                    image: "/uploads/blogs/section-image-1.jpg",  // New section image
                    caption: "This is a caption for section image 1"
                },
            ],
            featured: false
        };

        const response = await request(app)
            .post("/api/blogs/create")
            .send(newBlog);

        console.log("📝 Create Blog Response Body:", response.body);

        expect(response.statusCode).toBe(201);
        expect(response.body.blog.title).toBe("Test Blog with Images");
        expect(response.body.blog.feature_image).toBe(newBlog.feature_image);
        expect(response.body.blog.sections[0].image).toBe(newBlog.sections[0].image);
        expect(response.body.blog.sections[0].caption).toBe(newBlog.sections[0].caption);

        blogId = response.body.blog._id; // ✅ Capture the created blog's ID
    });

    test("Fetch all blogs", async () => {
        const response = await request(app).get("/api/blogs");
        console.log("📝 Fetch All Blogs Response:", response.body);
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body.blogs)).toBe(true);
        expect(response.body.blogs.length).toBeGreaterThan(0);
    });

    test("Fetch a blog by ID", async () => {
        if (!blogId) throw new Error("🚨 blogId is undefined. Previous test failed.");
        const response = await request(app).get(`/api/blogs/${blogId}`);
        console.log("📝 Fetch Single Blog Response:", response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body.blog.title).toBe("Test Blog with Images");
        expect(response.body.blog.feature_image).toBe("/uploads/blogs/feature-test-image.jpg");
        expect(response.body.blog.sections[0].image).toBe("/uploads/blogs/section-image-1.jpg");
        expect(response.body.blog.sections[0].caption).toBe("This is a caption for section image 1");
    });

    test("Update a blog including images and captions", async () => {
        if (!blogId) throw new Error("🚨 blogId is undefined. Previous test failed.");

        const updatedBlog = {
            title: "Updated Test Blog with Images",
            category: "NBA",
            author: "Updated Author",
            feature_image: "/uploads/blogs/updated-feature-image.jpg",  // Update main image
            sections: [
                {
                    heading: "Updated Section",
                    content: "Updated content with a new image.",
                    image: "/uploads/blogs/updated-section-image.jpg",  // Updated section image
                    caption: "Updated caption for section image"
                },
            ],
            featured: true
        };

        const response = await request(app)
            .put(`/api/blogs/${blogId}`)
            .send(updatedBlog);

        console.log("📝 Update Blog Response:", response.body);

        expect(response.statusCode).toBe(200);
        expect(response.body.blog.title).toBe("Updated Test Blog with Images");
        expect(response.body.blog.feature_image).toBe(updatedBlog.feature_image);
        expect(response.body.blog.sections[0].image).toBe(updatedBlog.sections[0].image);
        expect(response.body.blog.sections[0].caption).toBe(updatedBlog.sections[0].caption);
    });

    test("Toggle blog featured status", async () => {
        if (!blogId) throw new Error("🚨 blogId is undefined. Previous test failed.");
        const response = await request(app).put(`/api/blogs/${blogId}/feature`);
        console.log("📝 Toggle Feature Response:", response.body);

        expect(response.statusCode).toBe(200);
        expect(typeof response.body.blog.featured).toBe("boolean");
    });

    test("Delete a blog and confirm deletion", async () => {
        if (!blogId) throw new Error("🚨 blogId is undefined. Previous test failed.");

        const response = await request(app).delete(`/api/blogs/${blogId}`);
        console.log("📝 Delete Blog Response:", response.body);
        expect(response.statusCode).toBe(200);

        // Confirm blog was deleted
        const checkResponse = await request(app).get(`/api/blogs/${blogId}`);
        expect(checkResponse.statusCode).toBe(404);
    });
});
