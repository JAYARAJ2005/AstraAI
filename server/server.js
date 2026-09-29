require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const protect = require("./middleware/authMiddleware");

const app = express();

// =========================
// CORS
// =========================
//
// FRONTEND_URL in .env can be one address or a comma-separated
// list, e.g.:
//   FRONTEND_URL=https://astraai.vercel.app,https://astraai.netlify.app
//
// Local development (Vite on 5173) is always allowed, so your
// setup keeps working without changing .env.
// =========================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
        .split(",")
        .map((url) => url.trim())
    : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow tools with no origin, e.g. curl, Postman, server-to-server
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(
      `CORS blocked request from origin: ${origin}`
    );

    return callback(
      new Error("Not allowed by CORS")
    );
  },
  credentials: true,
};

// =========================
// Middleware
// =========================
app.use(cors(corsOptions));
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