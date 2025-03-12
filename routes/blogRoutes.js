const express = require("express");
const {
    fetchAllBlogs, 
    fetchBlog,
    fetchBlogsByCategory,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleFeaturedBlog
} = require("../controllers/blogController");

const router = express.Router();

// ✅ Debug Import
console.log("✅ blogRoutes - Imported toggleFeaturedBlog:", typeof toggleFeaturedBlog === "function" ? "Function" : toggleFeaturedBlog);

// ✅ Blog Routes
router.get("/", fetchAllBlogs);
router.get("/category/:category", fetchBlogsByCategory);
router.get("/:id", fetchBlog);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);
router.patch("/:id/feature", toggleFeaturedBlog); // ✅ Correctly uses toggleFeaturedBlog

module.exports = router;