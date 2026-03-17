// lambda.js
// AWS Lambda handler — wraps the Express app using serverless-http
// Used when deploying to Lambda + API Gateway

const serverless = require("serverless-http");
const app = require("./server");

module.exports.handler = serverless(app);
