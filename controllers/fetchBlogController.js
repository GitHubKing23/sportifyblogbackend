const Blog = require("../models/Blog");

/**
 * @desc Fetch all blogs (Optimized to return only summary fields)
 * @route GET /api/blogs
 * @access Public
 */
exports.getAllBlogs = async (req, res) => {
    try {
        // Only return key fields: title, category, author, feature_image, and featured status
        const blogs = await Blog.find().select("title category author feature_image featured createdAt");

        res.status(200).json({ blogs });
    } catch (error) {
        console.error("❌ Error fetching all blogs:", error);
        res.status(500).json({ error: "Server error while fetching all blogs" });
    }
};

/**
 * @desc Fetch a single blog by ID (returns full blog with all sections, images, etc.)
 * @route GET /api/blogs/:id
 * @access Public
 */
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Return full blog object including sections, images, captions, etc.
        res.status(200).json({ blog });
    } catch (error) {
        console.error("❌ Error fetching blog by ID:", error);
        res.status(500).json({ error: "Server error while fetching blog" });
    }
};
