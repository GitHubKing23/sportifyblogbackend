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

        console.log(`✅ Found ${blogs.length} blogs.`);
        disableCache(res);
        res.status(200).json(blogs);
    } catch (error) {
        console.error("❌ Error fetching all blogs:", error);
        res.status(500).json({ error: "Failed to fetch blogs" });
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
            return res.status(400).json({ error: "Blog ID is required" });
        }

        // Validate if the ID is a valid ObjectId
        let blog;
        if (mongoose.Types.ObjectId.isValid(id)) {
            blog = await Blog.findById(id);
        } else {
            // Fallback to findOne with string _id if ObjectId is invalid
            blog = await Blog.findOne({ _id: id });
        }

        if (!blog) {
            console.warn("❌ Blog not found:", id);
            return res.status(404).json({ error: "Blog not found" });
        }

        console.log("✅ Blog retrieved:", blog);
        disableCache(res);
        res.status(200).json(blog);
    } catch (error) {
        console.error("❌ Error fetching blog:", error);
        res.status(500).json({ error: "Failed to fetch blog" });
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
        console.error("❌ Error fetching blogs by category:", error);
        res.status(500).json({ error: "Failed to fetch blogs by category" });
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
        console.error("❌ Error fetching featured blogs:", error);
        res.status(500).json({ error: "Failed to fetch featured blogs" });
    }
};

/**
 * ✅ Create a new blog
 */
const createBlog = async (req, res) => {
    try {
        console.log("📝 Creating a new blog...");
        const newBlog = new Blog(req.body);
        await newBlog.save();

        console.log("✅ New Blog Created:", newBlog);
        disableCache(res);
        res.status(201).json({ message: "Blog created successfully", blog: newBlog });
    } catch (error) {
        console.error("❌ Error creating blog:", error);
        res.status(500).json({ error: "Failed to create blog" });
    }
};

/**
 * ✅ Update an existing blog
 */
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("📝 Updating blog ID:", id);

        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedBlog) {
            console.warn("❌ Blog not found for update:", id);
            return res.status(404).json({ error: "Blog not found" });
        }

        console.log("✅ Blog Updated:", updatedBlog);
        disableCache(res);
        res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        console.error("❌ Error updating blog:", error);
        res.status(500).json({ error: "Failed to update blog" });
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
        console.error("❌ Error deleting blog:", error);
        res.status(500).json({ error: "Failed to delete blog" });
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
        console.error("❌ Error toggling featured status:", error);
        res.status(500).json({ error: "Failed to toggle featured status" });
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
        console.error("❌ Error fetching paginated blogs:", error);
        res.status(500).json({ error: "Failed to fetch blogs with pagination" });
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