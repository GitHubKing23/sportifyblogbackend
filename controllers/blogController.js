const Blog = require("../models/Blog");
const mongoose = require("mongoose"); // Add mongoose for ObjectId validation

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
        console.log("🔍 Fetching all blogs from MongoDB...");
        const blogs = await Blog.find().sort({ createdAt: -1 });

        console.log(`✅ Found ${blogs.length} blogs. IDs:`, blogs.map(blog => blog._id.toString()));
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

        if (!id) {
            console.warn("⚠️ Blog ID is missing");
            return res.status(400).json({ error: "Blog ID is required" });
        }

        // Validate ID length (MongoDB ObjectId should be 24 characters)
        if (id.length !== 24) {
            console.warn(`⚠️ Invalid ID length (expected 24 characters): ${id}`);
            return res.status(400).json({ error: "Invalid blog ID length (must be 24 characters)" });
        }

        // Validate if the ID is a valid ObjectId
        let blog;
        if (mongoose.Types.ObjectId.isValid(id)) {
            console.log(`✅ Valid ObjectId: ${id}`);
            blog = await Blog.findById(id);
        } else {
            console.warn(`⚠️ Invalid ObjectId format: ${id}`);
            return res.status(400).json({ error: "Invalid blog ID format" });
        }

        if (!blog) {
            console.warn("❌ Blog not found:", id);
            return res.status(404).json({ error: "Blog not found" });
        }

        console.log("✅ Blog retrieved:", blog);
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

        // ✅ Case-insensitive matching for category
        const lowerCaseCategory = category.toLowerCase();
        const blogs = await Blog.find({
            category: { $regex: new RegExp(`^${lowerCaseCategory}$`, "i") }
        }).sort({ createdAt: -1 });

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
        const featuredBlogs = await Blog.find({ featured: true }).sort({ createdAt: -1 });

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

/**
 * ✅ Create a new blog (with SEO fields)
 */
const createBlog = async (req, res) => {
    try {
        console.log("📝 Creating a new blog...");
        // Accept SEO fields: metaTitle, metaDescription, slug
        const {
            title, category, author, feature_image, video_url, sections, featured, isPublished,
            metaTitle, metaDescription, slug
        } = req.body;
        const newBlog = new Blog({
            title, category, author, feature_image, video_url, sections, featured, isPublished,
            metaTitle, metaDescription, slug
        });
        await newBlog.save();

        console.log("✅ New Blog Created:", newBlog);
        disableCache(res);
        res.status(201).json({ message: "Blog created successfully", blog: newBlog });
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

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });

        if (!updatedBlog) {
            console.warn("❌ Blog not found for update:", id);
            return res.status(404).json({ error: "Blog not found" });
        }

        console.log("✅ Blog Updated:", updatedBlog);
        disableCache(res);
        res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
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

        const deletedBlog = await Blog.findByIdAndDelete(id);

        if (!deletedBlog) {
            console.warn("❌ Blog not found for deletion:", id);
            return res.status(404).json({ error: "Blog not found" });
        }

        console.log("✅ Blog Deleted:", deletedBlog._id);
        disableCache(res);
        res.status(200).json({ message: "Blog deleted successfully" });
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

        const blog = await Blog.findById(id);
        if (!blog) {
            console.warn("❌ Blog not found:", id);
            return res.status(404).json({ error: "Blog not found" });
        }

        blog.featured = !blog.featured; // ✅ Toggle featured status
        await blog.save();

        console.log(`✅ Blog ${blog.featured ? "Featured" : "Unfeatured"}:`, blog);
        disableCache(res);
        res.status(200).json({ message: `Blog ${blog.featured ? "featured" : "unfeatured"} successfully`, blog });
    } catch (error) {
        console.error("❌ Error toggling featured status:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ error: "Failed to toggle featured status", details: error.message });
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
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalBlogs = await Blog.countDocuments();
        disableCache(res);
        res.status(200).json({
            blogs,
            currentPage: page,
            totalPages: Math.ceil(totalBlogs / limit),
        });
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
};