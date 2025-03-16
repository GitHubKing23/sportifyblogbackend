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

// ✅ Define Blog Schema
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
        sections: [sectionSchema],  
        featured: { type: Boolean, default: false },  
        isPublished: { type: Boolean, default: true } 
    },
    { timestamps: true, collection: "created_blog_posts" } // ✅ Explicitly set collection name
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
