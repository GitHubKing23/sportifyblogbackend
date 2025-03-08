const fs = require('fs');
const path = require('path');
const Blog = require('../models/Blog'); // Assuming your Blog model is in models/Blog.js

const deleteBlog = async (req, res) => {
    const { id } = req.params;

    console.log(`🗑️ Deleting blog with ID: ${id}`);

    try {
        // Find the blog first to check for images (before deletion)
        const blog = await Blog.findById(id);

        if (!blog) {
            console.error(`❌ Blog with ID ${id} not found.`);
            return res.status(404).json({ error: 'Blog not found' });
        }

        // ✅ Clean up local images (feature image and section images)
        const deleteLocalImage = (imagePath) => {
            if (imagePath && !imagePath.startsWith('http')) { // Only delete local images, not URLs
                const fullPath = path.join(__dirname, '../', imagePath);
                fs.unlink(fullPath, (err) => {
                    if (err) {
                        console.warn(`⚠️ Failed to delete file: ${fullPath}`, err.message);
                    } else {
                        console.log(`🧹 Deleted file: ${fullPath}`);
                    }
                });
            }
        };

        // Delete feature image if it's local
        deleteLocalImage(blog.feature_image);

        // Delete section images if they are local
        if (blog.sections && Array.isArray(blog.sections)) {
            blog.sections.forEach(section => {
                deleteLocalImage(section.image);
            });
        }

        // ✅ Delete the blog after images are processed
        const deletedBlog = await Blog.findByIdAndDelete(id);

        console.log(`✅ Blog with ID ${id} successfully deleted.`);
        res.status(200).json({ message: 'Blog deleted successfully', blog: deletedBlog });

    } catch (error) {
        console.error(`❌ Error deleting blog with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while deleting blog' });
    }
};

module.exports = { deleteBlog };
