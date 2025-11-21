const blogService = require("../services/blogServiceArango");

/**
 * ✅ Helper function to set cache headers (Prevents 304 responses)
 */
const disableCache = (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Expires", "0");
    res.setHeader("Pragma", "no-cache");
};

/**
 * ✅ Fetch all blogs (sorted by newest first)
 */
const fetchAllBlogs = async (req, res) => {
    try {
        console.log("🔍 Fetching all blogs from ArangoDB...");
        const blogs = await blogService.getAll();
        console.log(`✅ Found ${blogs.length} blogs.`);
        disableCache(res);
        res.status(200).json(blogs);
    } catch (error) {
        console.error("❌ Error fetching all blogs:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to fetch blogs", details: error.message });
    }
};

/**
 * ✅ Fetch a single blog by ID
 */
const fetchBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching blog by ID: ${id}`);

        if (!id) return res.status(400).json({ error: 'Blog ID is required' });
        const blog = await blogService.getByKey(id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });
        disableCache(res);
        res.status(200).json(blog);
    } catch (error) {
        console.error("❌ Detailed error fetching blog:", {
            message: error.message,
            stack: error.stack,
            id: req.params.id,
        });
        res.status(500).json({ error: "Failed to fetch blog", details: error.message });
    }
};

/**
 * ✅ Fetch blogs by category (Ensures fresh response)
 */
const fetchBlogsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        console.log(`🔍 Fetching blogs for category: '${category}'`);

        if (!category) {
            return res.status(400).json({ error: "Category is required" });
        }

        const blogs = await blogService.getByCategory(category);

        if (!blogs.length) {
            console.warn(`⚠️ No blogs found for category: '${category}'`);
            disableCache(res);
            return res.status(200).json({ featured: [], others: [] });
        }

        console.log(`✅ Found ${blogs.length} blogs for category '${category}'`);
        console.log(`🔹 Featured Blogs: ${blogs.filter(b => b.featured).length}, Other Blogs: ${blogs.length - blogs.filter(b => b.featured).length}`);

        disableCache(res);
        res.status(200).json({
            featured: blogs.filter(blog => blog.featured),
            others: blogs.filter(blog => !blog.featured)
        });
    } catch (error) {
        console.error("❌ Error fetching blogs by category:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to fetch blogs by category", details: error.message });
    }
};

/**
 * ✅ Fetch only featured blogs
 */
const fetchFeaturedBlogs = async (req, res) => {
    try {
        console.log("🔍 Fetching featured blogs...");
        const featuredBlogs = await blogService.getFeatured();

        if (!featuredBlogs.length) {
            console.warn("⚠️ No featured blogs found.");
            disableCache(res);
            return res.status(200).json([]);
        }

        console.log(`✅ Found ${featuredBlogs.length} featured blogs`);
        disableCache(res);
        res.status(200).json(featuredBlogs);
    } catch (error) {
        console.error("❌ Error fetching featured blogs:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to fetch featured blogs", details: error.message });
    }
};

const getAuthorMeta = (user = {}, fallbackName = "Unknown Author") => {
    if (!user) return { authorId: null, authorEmail: null, authorName: fallbackName };
    return {
        authorId: user.userId || null,
        authorEmail: user.email || null,
        authorName: user.name || user.email || fallbackName,
    };
};

/**
 * ✅ Create a new blog (with SEO fields)
 */
const createBlog = async (req, res) => {
    try {
        console.log("📝 Creating a new blog...");
        const {
            title, category, author, feature_image, video_url, sections, featured, isPublished,
            metaTitle, metaDescription, slug
        } = req.body;

        const authorMeta = getAuthorMeta(req.user, author);
        const doc = {
            title,
            category,
            author: author || authorMeta.authorName,
            feature_image,
            video_url,
            sections,
            featured,
            isPublished,
            metaTitle,
            metaDescription,
            slug,
            authorId: authorMeta.authorId,
            authorEmail: authorMeta.authorEmail,
            authorName: authorMeta.authorName,
        };
        const created = await blogService.create(doc);
        console.log('✅ New Blog Created:', created._key || created._id || created);
        disableCache(res);
        res.status(201).json({ message: 'Blog created successfully', blog: created });
    } catch (error) {
        console.error("❌ Error creating blog:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to create blog", details: error.message });
    }
};

/**
 * ✅ Update an existing blog (with SEO fields)
 */
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("📝 Updating blog ID:", id);

        // Accept SEO fields: metaTitle, metaDescription, slug
        const updateFields = { ...req.body };
        const allowedFields = [
            "title", "category", "author", "feature_image", "video_url", "sections", "featured", "isPublished",
            "metaTitle", "metaDescription", "slug"
        ];
        // Only allow whitelisted fields
        Object.keys(updateFields).forEach(key => {
            if (!allowedFields.includes(key)) delete updateFields[key];
        });

        const authorMeta = getAuthorMeta(req.user, updateFields.author);
        updateFields.authorId = authorMeta.authorId;
        updateFields.authorEmail = authorMeta.authorEmail;
        updateFields.authorName = authorMeta.authorName;
        if (!updateFields.author) updateFields.author = authorMeta.authorName;

        const updated = await blogService.update(id, updateFields);
        if (!updated) return res.status(404).json({ error: 'Blog not found' });
        disableCache(res);
        res.status(200).json({ message: 'Blog updated successfully', blog: updated });
    } catch (error) {
        console.error("❌ Error updating blog:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to update blog", details: error.message });
    }
};

/**
 * ✅ Delete a blog
 */
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🗑 Deleting blog ID:", id);
        const ok = await blogService.remove(id);
        if (!ok) return res.status(404).json({ error: 'Blog not found' });
        disableCache(res);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error("❌ Error deleting blog:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to delete blog", details: error.message });
    }
};

/**
 * ✅ Toggle the featured status of a blog
 */
const toggleFeaturedBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🌟 Toggling featured status for blog ID:", id);
        const updated = await blogService.toggleFeatured(id);
        if (!updated) return res.status(404).json({ error: 'Blog not found' });
        disableCache(res);
        res.status(200).json({ message: `Blog ${updated.featured ? 'featured' : 'unfeatured'} successfully`, blog: updated });
    } catch (error) {
        console.error("❌ Error toggling featured status:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to toggle featured status", details: error.message });
    }
};

/**
 * ❤️ Increment likes for a blog
 */
const likeBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`➕ Liking blog ID: ${id}`);
        // identify user uniquely by userId/email for like tracking
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
        const identifier = (req.user.userId || req.user.email || '').toString().toLowerCase();
        if (!identifier) return res.status(400).json({ error: 'User identifier missing in token' });
        const result = await blogService.like(id, identifier);
        if (result.alreadyLiked) return res.status(400).json({ error: 'Already liked', likes: result.likes });
        disableCache(res);
        res.status(200).json({ likes: result.likes });
    } catch (error) {
        console.error('❌ Error liking blog:', { message: error.message, stack: error.stack });
        res.status(500).json({ error: 'Failed to update likes', details: error.message });
    }
};

/**
 * 💬 Add a comment to a blog
 */
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        // determine author from authenticated user if available
        let author = 'Anonymous';
        if (req.user) {
            author = req.user.name || req.user.email || author;
        } else if (req.body.user) {
            author = req.body.user;
        }

        console.log(`💬 Adding comment to blog ID: ${id} by user: ${author}`);
        if (!text) return res.status(400).json({ error: 'Comment text is required' });
        const comments = await blogService.addComment(id, author, text);
        disableCache(res);
        res.status(201).json({ comments });
    } catch (error) {
        console.error('❌ Error adding comment:', { message: error.message, stack: error.stack });
        res.status(500).json({ error: 'Failed to post comment', details: error.message });
    }
};

/**
 * 📄 Get comments for a blog
 */
const getComments = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching comments for blog ID: ${id}`);
        const comments = await blogService.getComments(id);
        disableCache(res);
        res.status(200).json(comments || []);
    } catch (error) {
        console.error('❌ Error fetching comments:', { message: error.message, stack: error.stack });
        res.status(500).json({ error: 'Failed to load comments', details: error.message });
    }
};

/**
 * ✅ Fetch blogs with pagination
 */
const fetchPaginatedBlogs = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;

        console.log(`🔍 Fetching blogs with pagination: Page ${page}, Limit ${limit}`);
        const { items, total } = await blogService.getPaginated(page, limit);
        disableCache(res);
        res.status(200).json({ blogs: items, currentPage: page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error("❌ Error fetching paginated blogs:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to fetch blogs with pagination", details: error.message });
    }
};

// ✅ Export updated controllers
module.exports = {
    fetchAllBlogs,
    fetchBlog,
    fetchBlogsByCategory,
    fetchFeaturedBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleFeaturedBlog,
    fetchPaginatedBlogs,
    likeBlog,
    addComment,
    getComments,
};