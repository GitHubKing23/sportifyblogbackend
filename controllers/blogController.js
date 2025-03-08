const Blog = require("../models/Blog"); // Make sure Blog model exists and is correctly structured

// ✅ Controller to fetch blogs by category
const getBlogsByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const blogs = await Blog.find({ category });

        if (blogs.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }

        res.json({ blogs });
    } catch (error) {
        console.error("❌ Error in getBlogsByCategory controller:", error.message);
        res.status(500).json({ error: "Failed to fetch blogs by category." });
    }
};

module.exports = { getBlogsByCategory };
