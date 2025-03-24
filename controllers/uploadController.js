// controllers/uploadController.js

const path = require("path");

// ✅ Helper function to validate file type
const isValidFileType = (file, allowedTypes) => {
    return file && allowedTypes.includes(file.mimetype);
};

// ✅ Handle image uploads
const uploadImageHandler = (req, res) => {
    if (!req.file) {
        console.error("❌ No image file uploaded.");
        return res.status(400).json({ error: "No image file uploaded" });
    }

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!isValidFileType(req.file, allowedImageTypes)) {
        return res.status(400).json({ error: "Invalid image format. Allowed: JPG, PNG, WEBP" });
    }

    // ✅ Construct full URL
    const fullUrl = `${req.protocol}://${req.get("host")}/uploads/blogs/${req.file.filename}`;
    console.log(`✅ Image uploaded successfully: ${fullUrl}`);

    res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: fullUrl,
        fileName: req.file.filename
    });
};

// ✅ Handle video uploads
const uploadVideoHandler = (req, res) => {
    if (!req.file) {
        console.error("❌ No video file uploaded.");
        return res.status(400).json({ error: "No video file uploaded" });
    }

    const allowedVideoTypes = ["video/mp4", "video/mov"];
    if (!isValidFileType(req.file, allowedVideoTypes)) {
        return res.status(400).json({ error: "Invalid video format. Allowed: MP4, MOV" });
    }

    // ✅ Construct full URL
    const fullUrl = `${req.protocol}://${req.get("host")}/uploads/videos/${req.file.filename}`;
    console.log(`✅ Video uploaded successfully: ${fullUrl}`);

    res.status(200).json({
        message: "Video uploaded successfully",
        videoUrl: fullUrl,
        fileName: req.file.filename
    });
};

module.exports = {
    uploadImageHandler,
    uploadVideoHandler
};
