// services/s3Service.js
// Handles all S3 operations: upload, presigned URL generation, and delete

const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client } = require("./awsConfig");

const BUCKET = process.env.S3_BUCKET_NAME;

// Upload a file buffer to S3
const uploadFile = async (fileBuffer, fileName, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  });
  await s3Client.send(command);
  return `https://${BUCKET}.s3.amazonaws.com/${fileName}`;
};

// Generate a pre-signed URL valid for 15 minutes
const getPresignedUrl = async (fileKey) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: fileKey });
  return await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min
};

// Delete a file from S3 by its key
const deleteFile = async (fileKey) => {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: fileKey });
  await s3Client.send(command);
};

module.exports = { uploadFile, getPresignedUrl, deleteFile };
