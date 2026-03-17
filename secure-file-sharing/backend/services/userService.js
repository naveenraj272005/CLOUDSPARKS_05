// services/userService.js
// Handles user storage in DynamoDB (used for JWT-based auth)

const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const { dynamoDocClient } = require("./awsConfig");

const USER_TABLE = process.env.DYNAMODB_USERS_TABLE || "SecureFileSharingUsers";

// Save a new user record (email + hashed password)
const createUser = async (user) => {
  const command = new PutCommand({ TableName: USER_TABLE, Item: user });
  await dynamoDocClient.send(command);
};

// Fetch a user by email (email is the partition key)
const getUserByEmail = async (email) => {
  const command = new GetCommand({ TableName: USER_TABLE, Key: { email } });
  const result = await dynamoDocClient.send(command);
  return result.Item || null;
};

module.exports = { createUser, getUserByEmail };
