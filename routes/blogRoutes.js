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
    fetchPaginatedBlogs
} = require("../controllers/blogController");

const router = express.Router();

// ✅ Debug Import
console.log("✅ blogRoutes.js loaded successfully");
console.log("✅ Imported toggleFeaturedBlog:", typeof toggleFeaturedBlog === "function" ? "Function" : "Not a function");

// ✅ Blog Routes
router.get("/", fetchAllBlogs);
router.get("/category/:category", fetchBlogsByCategory); // ✅ Fetch blogs by category
router.get("/featured", fetchFeaturedBlogs); // ✅ Fetch only featured blogs
router.get("/:id", fetchBlog);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);
router.patch("/:id/feature", toggleFeaturedBlog); // ✅ Toggle featured blog
router.get("/paginated", fetchPaginatedBlogs); // ✅ Fetch paginated blogs

// ✅ Debugging for route initialization
console.log("✅ Blog routes successfully initialized.");

module.exports = router;
