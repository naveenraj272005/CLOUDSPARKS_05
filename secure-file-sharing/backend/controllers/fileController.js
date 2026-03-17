// controllers/fileController.js
// Handles all file operations: upload, list, download, delete

const { v4: uuidv4 } = require("uuid");
const { uploadFile, getPresignedUrl, deleteFile } = require("../services/s3Service");
const { saveFileMetadata, getFilesByUser, getFileById, deleteFileMetadata } = require("../services/dynamoService");

// POST /upload — Upload file to S3 and save metadata to DynamoDB
const upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });

  const { userId, email } = req.user;
  const { accessType = "private" } = req.body;
  const fileId = uuidv4();
  const fileKey = `${userId}/${fileId}-${req.file.originalname}`;

  try {
    const fileUrl = await uploadFile(req.file.buffer, fileKey, req.file.mimetype);

    const metadata = {
      fileId,
      fileName: req.file.originalname,
      userId,
      userEmail: email,
      fileUrl,
      fileKey,
      accessType,
      createdAt: new Date().toISOString(),
    };

    await saveFileMetadata(metadata);
    res.status(201).json({ message: "File uploaded successfully", file: metadata });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /files — List all files for the authenticated user
const listFiles = async (req, res) => {
  try {
    const files = await getFilesByUser(req.user.userId);
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /download/:id — Generate a pre-signed URL for secure download
const download = async (req, res) => {
  try {
    const file = await getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Ensure the file belongs to the requesting user
    if (file.userId !== req.user.userId)
      return res.status(403).json({ error: "Access denied" });

    const url = await getPresignedUrl(file.fileKey);
    res.json({ downloadUrl: url, expiresIn: "15 minutes" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /delete/:id — Delete file from S3 and remove metadata from DynamoDB
const deleteFileHandler = async (req, res) => {
  try {
    const file = await getFileById(req.params.id);
    if (!file) return res.status(404).json({ error: "File not found" });

    // Ensure the file belongs to the requesting user
    if (file.userId !== req.user.userId)
      return res.status(403).json({ error: "Access denied" });

    await deleteFile(file.fileKey);
    await deleteFileMetadata(file.fileId);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { upload, listFiles, download, deleteFileHandler };
