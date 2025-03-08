const Blog = require('../models/Blog');  // Assuming Blog model is in models/Blog.js

// Update a blog post by ID
const updateBlog = async (req, res) => {
    const { id } = req.params;

    console.log(`✏️ Updating blog with ID: ${id}`);

    try {
        const updateData = req.body;

        // Optional: Validate sections if present in update
        if (updateData.sections && Array.isArray(updateData.sections)) {
            for (const section of updateData.sections) {
                if (!section.heading || !section.content) {
                    return res.status(400).json({ error: 'Each section must have a heading and content.' });
                }
            }
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedBlog) {
            console.error(`❌ Blog with ID ${id} not found.`);
            return res.status(404).json({ error: 'Blog not found' });
        }

        console.log(`✅ Blog with ID ${id} updated successfully.`);
        res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });

    } catch (error) {
        console.error(`❌ Error updating blog with ID ${id}:`, error.message);
        res.status(500).json({ error: 'Internal server error while updating blog' });
    }
};

module.exports = { updateBlog };
