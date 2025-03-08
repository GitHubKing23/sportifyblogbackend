const Blog = require('../models/Blog');  // Assuming Blog model is in models/Blog.js

// Toggle the "featured" status of a blog post
const toggleFeaturedBlog = async (req, res) => {
    const { id } = req.params;

    console.log(`⭐ Toggling featured status for blog with ID: ${id}`);

    try {
        const blog = await Blog.findById(id);

        if (!blog) {
            console.error(`❌ Blog with ID ${id} not found.`);
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Toggle the featured field
        blog.featured = !blog.featured;

        await blog.save();

        console.log(`✅ Blog with ID ${id} featured status updated to: ${blog.featured}`);
        res.status(200).json({ message: 'Blog featured status updated successfully', blog });
    } catch (error) {
        console.error(`❌ Error updating featured status for blog with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while updating featured status' });
    }
};

module.exports = { toggleFeaturedBlog };
