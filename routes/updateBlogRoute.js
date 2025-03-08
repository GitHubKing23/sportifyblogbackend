const express = require('express');
const router = express.Router();
const { updateBlog } = require('../controllers/updateBlogController');

// ===============================================
// @route   PUT /api/blogs/:id
// @desc    Update an existing blog post (including sections & images if needed)
// @access  Public (can be restricted to authenticated users if needed)
// ===============================================
router.put('/:id', updateBlog);

module.exports = router;
