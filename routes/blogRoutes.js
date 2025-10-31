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

const authenticate = require('../middleware/authMiddleware');
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

// Social routes (likes & comments) - require authentication for write actions
router.post("/:id/like", authenticate(), likeBlog);
router.post("/:id/comment", authenticate(), addComment);
router.get("/:id/comments", getComments);

// Protected write routes - require admin wallet via JWT from auth backend
router.post("/", authenticate(true), createBlog);
router.put("/:id", authenticate(true), updateBlog);
router.delete("/:id", authenticate(true), deleteBlog);
router.patch("/:id/feature", authenticate(true), toggleFeaturedBlog); // ✅ Toggle featured blog

// ✅ Debugging for route initialization
console.log("✅ Blog routes successfully initialized.");

module.exports = router;
