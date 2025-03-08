const express = require('express');
const router = express.Router();
const { toggleFeaturedBlog } = require('../controllers/featureBlogController');

// ===================================================
// @route   PUT /api/blogs/:id/feature
// @desc    Toggle the featured status of a blog post
// @access  Public (consider restricting to Admin in future)
// ===================================================
router.put('/:id/feature', toggleFeaturedBlog);

module.exports = router;
