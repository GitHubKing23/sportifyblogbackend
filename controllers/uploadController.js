// controllers/uploadController.js

const uploadImageHandler = (req, res) => {
    if (!req.file) {
        console.error("❌ No image file uploaded.");
        return res.status(400).json({ error: "No image file uploaded" });
    }

    console.log(`✅ Image uploaded successfully: ${req.file.filename}`);
    res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: `/uploads/blogs/${req.file.filename}`,
        fileName: req.file.filename // Optional - useful if you need the filename directly
    });
};

const uploadVideoHandler = (req, res) => {
    if (!req.file) {
        console.error("❌ No video file uploaded.");
        return res.status(400).json({ error: "No video file uploaded" });
    }

    console.log(`✅ Video uploaded successfully: ${req.file.filename}`);
    res.status(200).json({
        message: "Video uploaded successfully",
        videoUrl: `/uploads/videos/${req.file.filename}`,
        fileName: req.file.filename // Optional - useful if you need the filename directly
    });
};

module.exports = {
    uploadImageHandler,
    uploadVideoHandler
};
