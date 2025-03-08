const express = require('express');
const router = express.Router();
const { getBlogById } = require('../controllers/fetchBlogController');

// ===================================================
// @route   GET /api/blogs/:id
// @desc    Fetch a single blog by ID
// @access  Public
// ===================================================
router.get('/:id', getBlogById);

module.exports = router;
