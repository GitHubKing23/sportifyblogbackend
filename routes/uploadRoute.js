const express = require("express");
const multer = require("multer");
const path = require("path");
const {
    uploadImageHandler,
    uploadVideoHandler
} = require("../controllers/uploadController");

const router = express.Router();

/**
 * ✅ Helper function to configure multer storage
 * @param {string} folderPath - Destination folder for files
 * @returns {multer.StorageEngine}
 */
const getStorage = (folderPath) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

/**
 * ✅ Basic file filter to allow only specific file types
 * @param {Request} req
 * @param {File} file
 * @param {function} cb
 */
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/mov"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Unsupported file type"), false);
    }
};

// ✅ Configure Multer for Images
const uploadImage = multer({
    storage: getStorage("uploads/blogs/"),
    fileFilter
});

// ✅ Configure Multer for Videos
const uploadVideo = multer({
    storage: getStorage("uploads/videos/"),
    fileFilter
});

/**
 * ===========================================
 * @route   POST /api/upload/image
 * @desc    Upload blog image
 * @access  Public
 * ===========================================
 */
router.post("/image", uploadImage.single("image"), uploadImageHandler);

/**
 * ===========================================
 * @route   POST /api/upload/video
 * @desc    Upload blog video
 * @access  Public
 * ===========================================
 */
router.post("/video", uploadVideo.single("video"), uploadVideoHandler);

module.exports = router;
