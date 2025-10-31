const mongoose = require("mongoose");

// ✅ Predefined list of categories
const CATEGORIES = ["NBA", "NHL", "NFL", "MLB", "Esports", "Footy", "Other"];

// ✅ Define Section Schema (each section can have optional images and captions)
const sectionSchema = new mongoose.Schema({
    heading: { type: String, required: true },
    content: { type: String, required: true },
    image: { 
        type: String,
        validate: {
            validator: function(v) {
                // Allow empty or valid URLs or local uploads path
                return !v || /^(https?:\/\/|\/uploads\/)/.test(v);
            },
            message: props => `${props.value} is not a valid image URL or local file path!`
        }
    },
    caption: { type: String } // Optional caption for section images
});


// ✅ Define Blog Schema with SEO fields
const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        category: { 
            type: String, 
            required: true, 
            enum: CATEGORIES,  
            default: "Other"
        },
        author: { type: String, default: "Anonymous" },
        feature_image: { 
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^(https?:\/\/|\/uploads\/)/.test(v);
                },
                message: props => `${props.value} is not a valid feature image URL or local file path!`
            }
        },
        video_url: { 
            type: String,
            validate: {
                validator: function(v) {
                    return !v || /^(https?:\/\/)/.test(v);
                },
                message: props => `${props.value} is not a valid video URL!`
            }
        },
        // --- SEO ENHANCEMENTS ---
        metaTitle: { type: String, maxlength: 70 }, // For SEO title tag
        metaDescription: { type: String, maxlength: 160 }, // For SEO meta description
        slug: {
            type: String,
            lowercase: true,
            trim: true,
            unique: true,
            sparse: true,
            match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'is invalid (use kebab-case, e.g. my-blog-title)']
        },
        // --- END SEO ENHANCEMENTS ---
        sections: [sectionSchema],  
        featured: { type: Boolean, default: false },  
        isPublished: { type: Boolean, default: true },
        // --- Social features ---
        likes: { type: Number, default: 0 },
        comments: [
            new mongoose.Schema({
                user: { type: String, default: 'Anonymous' },
                text: { type: String, required: true },
                date: { type: Date, default: Date.now }
            }, { _id: true })
        ]
        ,
        // track which wallets/users have liked this post to prevent duplicates
        likedBy: {
            type: [String],
            default: []
        }
    },
    { timestamps: true, collection: "created_blog_posts" } // ✅ Explicitly set collection name
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
