const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { uploadImageHandler, uploadVideoHandler } = require("../controllers/uploadController");

dotenv.config(); // ✅ Load environment variables

const router = express.Router();

// ✅ Ensure upload directories exist
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📂 Created directory: ${dir}`);
    }
};

const blogUploadDir = process.env.UPLOADS_BLOGS_PATH || "uploads/blogs/";
const videoUploadDir = process.env.UPLOADS_VIDEOS_PATH || "uploads/videos/";

ensureDirExists(blogUploadDir);
ensureDirExists(videoUploadDir);

/**
 * ✅ Configures Multer Storage Engine
 * @param {string} folderPath - Destination folder for files
 * @returns {multer.StorageEngine}
 */
const getStorage = (folderPath) => multer.diskStorage({
    destination: (req, file, cb) => cb(null, folderPath),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

/**
 * ✅ File filter to allow only specific file types
 * @param {Request} req
 * @param {File} file
 * @param {function} cb
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/mov"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.error(`❌ Unsupported file type: ${file.mimetype}`);
        cb(new Error("Unsupported file type"), false);
    }
};

// ✅ Configure Multer for Images
const uploadImage = multer({
    storage: getStorage(blogUploadDir),
    fileFilter
});

// ✅ Configure Multer for Videos
const uploadVideo = multer({
    storage: getStorage(videoUploadDir),
    fileFilter
});

/**
 * ===========================================
 * @route   POST /api/upload/image
 * @desc    Upload blog image
 * @access  Public
 * ===========================================
 */
router.post("/image", uploadImage.single("image"), (req, res) => {
    if (!req.file) {
        console.error("❌ No image file uploaded.");
        return res.status(400).json({ error: "No image file uploaded" });
    }
    console.log(`✅ Image uploaded successfully: ${req.file.filename}`);
    res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: `/uploads/blogs/${req.file.filename}`,
        fileName: req.file.filename
    });
});

/**
 * ===========================================
 * @route   POST /api/upload/video
 * @desc    Upload blog video
 * @access  Public
 * ===========================================
 */
router.post("/video", uploadVideo.single("video"), (req, res) => {
    if (!req.file) {
        console.error("❌ No video file uploaded.");
        return res.status(400).json({ error: "No video file uploaded" });
    }
    console.log(`✅ Video uploaded successfully: ${req.file.filename}`);
    res.status(200).json({
        message: "Video uploaded successfully",
        videoUrl: `/uploads/videos/${req.file.filename}`,
        fileName: req.file.filename
    });
});

module.exports = router;
