// services/dynamoService.js
// Handles all DynamoDB operations for file metadata

const { PutCommand, GetCommand, QueryCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("./awsConfig");

const TABLE = process.env.DYNAMODB_TABLE_NAME;

// Save file metadata after a successful S3 upload
const saveFileMetadata = async (metadata) => {
  const command = new PutCommand({ TableName: TABLE, Item: metadata });
  await dynamoDocClient.send(command);
};

// Get all files belonging to a specific user
const getFilesByUser = async (userId) => {
  const command = new QueryCommand({
    TableName: TABLE,
    IndexName: "userId-index", // GSI on userId
    KeyConditionExpression: "userId = :uid",
    ExpressionAttributeValues: { ":uid": userId },
  });
  const result = await dynamoDocClient.send(command);
  return result.Items || [];
};

// Get a single file record by its fileId
const getFileById = async (fileId) => {
  const command = new GetCommand({ TableName: TABLE, Key: { fileId } });
  const result = await dynamoDocClient.send(command);
  return result.Item;
};

// Delete file metadata from DynamoDB
const deleteFileMetadata = async (fileId) => {
  const command = new DeleteCommand({ TableName: TABLE, Key: { fileId } });
  await dynamoDocClient.send(command);
};

module.exports = { saveFileMetadata, getFilesByUser, getFileById, deleteFileMetadata };
