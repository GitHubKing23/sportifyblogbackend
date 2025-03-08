const express = require('express');
const router = express.Router();
const { deleteBlog } = require('../controllers/deleteBlogController');

// DELETE /api/blogs/:id — Delete a specific blog
router.delete('/:id', deleteBlog);

module.exports = router;
