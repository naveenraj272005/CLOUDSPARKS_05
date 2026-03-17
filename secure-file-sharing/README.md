# 🔐 Secure File Sharing Platform

A full-stack web application for securely uploading, managing, and sharing files using AWS services.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, plain CSS, Axios             |
| Backend    | Node.js, Express                    |
| Auth       | AWS Cognito (JWT)                   |
| Storage    | AWS S3 (pre-signed URLs)            |
| Database   | AWS DynamoDB                        |
| Deployment | AWS Lambda + API Gateway (optional) |

---

## Project Structure

```
secure-file-sharing/
├── backend/
│   ├── controllers/
│   │   ├── authController.js     # Signup, confirm, login
│   │   └── fileController.js     # Upload, list, download, delete
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification via Cognito JWKS
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── fileRoutes.js
│   ├── services/
│   │   ├── awsConfig.js          # AWS SDK client initialization
│   │   ├── cognitoService.js     # Cognito operations
│   │   ├── dynamoService.js      # DynamoDB operations
│   │   └── s3Service.js          # S3 operations
│   ├── server.js                 # Express app entry point
│   ├── lambda.js                 # Lambda handler wrapper
│   └── .env                      # Environment variables (never commit)
└── frontend/
    └── src/
        ├── api/axiosClient.js    # Axios with auth interceptor
        ├── context/AuthContext.js
        ├── components/PrivateRoute.js
        ├── pages/
        │   ├── Login.js
        │   ├── Signup.js
        │   └── Dashboard.js
        ├── App.js
        └── App.css
```

---

## ⚙️ AWS Setup (Do This First)

### 1. Create S3 Bucket
1. Go to **S3 Console** → Create bucket
2. Name it (e.g., `my-secure-file-sharing-bucket`)
3. Uncheck "Block all public access" only if needed (keep blocked for private files)
4. Enable CORS on the bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": []
  }
]
```

### 2. Create DynamoDB Table
1. Go to **DynamoDB Console** → Create table
2. Table name: `SecureFileSharing`
3. Partition key: `fileId` (String)
4. Create a **GSI (Global Secondary Index)**:
   - Index name: `userId-index`
   - Partition key: `userId` (String)

### 3. Create Cognito User Pool
1. Go to **Cognito Console** → Create User Pool
2. Sign-in option: **Email**
3. Password policy: Minimum 8 chars, require uppercase, number, symbol
4. Enable **USER_PASSWORD_AUTH** flow in App Client settings
5. Note down:
   - **User Pool ID** (e.g., `us-east-1_xxxxxxxxx`)
   - **App Client ID**

### 4. Create IAM User for Local Dev
1. Go to **IAM Console** → Create user
2. Attach policies:
   - `AmazonS3FullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonCognitoPowerUser`
3. Create **Access Key** → copy `Access Key ID` and `Secret Access Key`

---

## 🚀 Running Locally

### Backend
```bash
cd backend

# Install dependencies
npm install

# Copy and fill in your AWS credentials
# Edit .env with your actual values

# Start the server
npm start
# Server runs at http://localhost:5000
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
# App runs at http://localhost:3000
```

---

## 📡 API Endpoints

| Method | Endpoint           | Auth Required | Description                    |
|--------|--------------------|---------------|--------------------------------|
| POST   | /auth/signup       | No            | Register new user              |
| POST   | /auth/confirm      | No            | Confirm email with code        |
| POST   | /auth/login        | No            | Login, returns JWT tokens      |
| POST   | /upload            | Yes           | Upload file to S3              |
| GET    | /files             | Yes           | List user's files              |
| GET    | /download/:id      | Yes           | Get pre-signed download URL    |
| DELETE | /delete/:id        | Yes           | Delete file from S3 + DynamoDB |

All protected routes require: `Authorization: Bearer <idToken>`

---

## ☁️ Deploying Backend to AWS Lambda + API Gateway

### Step 1: Install serverless-http
```bash
cd backend
npm install serverless-http
```

### Step 2: Zip the backend
```bash
# From the backend directory
zip -r backend.zip . -x "*.git*"
```

### Step 3: Create Lambda Function
1. Go to **Lambda Console** → Create function
2. Runtime: **Node.js 18.x**
3. Upload the `backend.zip`
4. Set Handler to: `lambda.handler`
5. Add all environment variables from `.env` in the **Configuration → Environment variables** tab
6. Attach an IAM role with S3, DynamoDB, and Cognito permissions

### Step 4: Create API Gateway
1. Go to **API Gateway Console** → Create HTTP API
2. Add integration: **Lambda** → select your function
3. Add route: `ANY /{proxy+}` → Lambda integration
4. Deploy the API
5. Copy the **Invoke URL**

### Step 5: Update Frontend
```
# In frontend/.env
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com
```

### Step 6: Deploy Frontend (Optional — S3 Static Hosting)
```bash
cd frontend
npm run build
# Upload the build/ folder to an S3 bucket with static website hosting enabled
# Or deploy to AWS Amplify / CloudFront
```

---

## 🔒 Security Notes

- JWT tokens are validated against Cognito's public JWKS endpoint
- Pre-signed URLs expire in 15 minutes
- Each user can only access their own files (enforced server-side)
- Never commit `.env` files — use AWS Secrets Manager in production
- Enable S3 bucket versioning and server-side encryption for production

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | Check S3 CORS config and backend CORS origin setting |
| 401 Unauthorized | Ensure Cognito User Pool ID and Client ID are correct |
| File not found | Verify DynamoDB GSI `userId-index` is created |
| Upload fails | Check S3 bucket name and IAM permissions |
| Cognito auth error | Enable `USER_PASSWORD_AUTH` in Cognito App Client |
