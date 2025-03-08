const express = require('express');
const router = express.Router();
const { createBlog } = require('../controllers/createBlogController');

// ================================================
// @route   POST /api/blogs/create
// @desc    Create a new blog post
// @access  Public (can change to Private if needed)
// ================================================
router.post('/create', createBlog);

module.exports = router;
