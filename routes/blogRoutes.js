const express = require("express");
const {
    fetchAllBlogs, 
    fetchBlog,
    fetchBlogsByCategory,
    fetchFeaturedBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleFeaturedBlog,
    likeBlog,
    addComment,
    getComments,
    fetchPaginatedBlogs
} = require("../controllers/blogController");

const { verifyToken, requireWriterOrAdmin, requireAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ Debug Import
console.log("✅ blogRoutes.js loaded successfully");
console.log("✅ Imported toggleFeaturedBlog:", typeof toggleFeaturedBlog === "function" ? "Function" : "Not a function");

// ✅ Blog Routes
router.get("/", fetchAllBlogs);
router.get("/category/:category", fetchBlogsByCategory); // ✅ Fetch blogs by category
router.get("/featured", fetchFeaturedBlogs); // ✅ Fetch only featured blogs
router.get("/paginated", fetchPaginatedBlogs); // ✅ Fetch paginated blogs
router.get("/:id", fetchBlog);

// Social routes require Authorization: Bearer <accessToken>
router.post("/:id/like", verifyToken, likeBlog);
router.post("/:id/comment", verifyToken, addComment);
router.get("/:id/comments", getComments);

// Protected write routes (Authorization: Bearer <accessToken>)
router.post("/", verifyToken, requireWriterOrAdmin, createBlog);
router.put("/:id", verifyToken, requireWriterOrAdmin, updateBlog);
router.delete("/:id", verifyToken, requireAdmin, deleteBlog);
router.patch("/:id/feature", verifyToken, requireWriterOrAdmin, toggleFeaturedBlog); // ✅ Toggle featured blog

// ✅ Debugging for route initialization
console.log("✅ Blog routes successfully initialized.");

module.exports = router;
