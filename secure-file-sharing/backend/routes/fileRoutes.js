// routes/fileRoutes.js
const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { upload, listFiles, download, deleteFileHandler } = require("../controllers/fileController");

const router = express.Router();

// Use memory storage so we can pass the buffer directly to S3
const memStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

// All file routes are protected by JWT auth
router.post("/upload", authMiddleware, memStorage.single("file"), upload);
router.get("/files", authMiddleware, listFiles);
router.get("/download/:id", authMiddleware, download);
router.delete("/delete/:id", authMiddleware, deleteFileHandler);

module.exports = router;
