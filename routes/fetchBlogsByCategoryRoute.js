const express = require("express");
const Blog = require("../models/Blog");
const router = express.Router();

// ✅ Existing: Fetch Blogs by Category
router.get("/category/:category", async (req, res) => {
    const { category } = req.params;

    try {
        const blogs = await Blog.find({ category });

        if (blogs.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ blogs });
    } catch (err) {
        console.error(`❌ Error fetching blogs by category:`, err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ NEW: Fetch Distinct Categories from Blogs Collection
router.get("/categories", async (req, res) => {
    try {
        const categories = await Blog.distinct("category");
        res.json({ categories });
    } catch (err) {
        console.error(`❌ Error fetching categories:`, err.message);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

module.exports = router;
