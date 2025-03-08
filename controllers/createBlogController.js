const Blog = require("../models/Blog");

// ✅ Create Blog Controller (supports section images & captions)
exports.createBlog = async (req, res) => {
    console.log("📥 Incoming Blog Data:", JSON.stringify(req.body, null, 2)); // Log incoming data for debugging

    try {
        const { title, category, author, sections, feature_image, video_url, featured } = req.body;

        // Basic validation (you can expand this if needed)
        if (!title || !category || !author || !sections || sections.length === 0) {
            return res.status(400).json({ error: "All fields are required, including at least one section." });
        }

        // Optional: Validate each section (especially for new fields like images & captions)
        for (const section of sections) {
            if (!section.heading || !section.content) {
                return res.status(400).json({ error: "Each section must have a heading and content." });
            }

            // Section images can be optional, so no strict check for `section.image`
        }

        const newBlog = new Blog({
            title,
            category,
            author,
            feature_image,     // Optional: URL or local file path (from uploads folder if using Multer)
            video_url,         // Optional
            sections,          // Sections with headings, content, images, and captions
            featured: featured || false // Optional, defaults to false
        });

        const savedBlog = await newBlog.save();
        console.log("✅ Blog Created Successfully:", savedBlog); // Debug log

        res.status(201).json({ message: "Blog created successfully", blog: savedBlog });
    } catch (error) {
        console.error("❌ Error creating blog:", error.message);
        res.status(500).json({ error: "Internal server error while creating blog" });
    }
};
