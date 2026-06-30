import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile) or whitelisted origins
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} is not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Payload Parsing
app.use(express.json());

// API Rate Limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again after 15 minutes." }
});
app.use("/api/", limiter);

// API Routes
app.use("/api/emails", emailRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(), 
    database: req.app.get("dbConnected") ? "Connected" : "Offline / Sandbox Mode"
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Express App Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "An internal server error occurred",
    error: process.env.NODE_ENV === "production" ? {} : err.stack
  });
});

export default app;
