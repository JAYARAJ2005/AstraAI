require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// Routes
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// =========================
// Connect to MongoDB
// =========================
connectDB();

// =========================
// Test Route
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to AstraAI API 🚀",
    status: "Server is running",
  });
});

// =========================
// Protected JWT Test Route
// =========================
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "JWT authentication successful 🔐",
    userId: req.user,
  });
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`AstraAI Server running on port ${PORT}`);
});