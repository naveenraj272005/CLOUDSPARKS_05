// controllers/authController.js
// Handles user signup and login using bcrypt + JWT (no Cognito)

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { createUser, getUserByEmail } = require("../services/userService");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

// POST /auth/signup — Hash password and store user in DynamoDB
const signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });

  try {
    // Check if user already exists
    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    await createUser({ email, password: hashedPassword, userId, createdAt: new Date().toISOString() });

    res.status(201).json({ message: "Account created successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/login — Verify password and return JWT token
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

    // Sign JWT with userId and email as payload
    const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, login };
