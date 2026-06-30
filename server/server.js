import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

// Load Environment Variables
dotenv.config();

const PORT = process.env.PORT || 5000;

import mongoose from "mongoose";

// Initialize Database connection
connectDB().then(() => {
  // Check if mongoose successfully connected
  const connected = mongoose.connection.readyState === 1;
  app.set("dbConnected", connected);
  
  app.listen(PORT, () => {
    console.log(`Express Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Server database connect error on startup:", err);
  app.set("dbConnected", false);
  app.listen(PORT, () => {
    console.log(`Express Server running in offline database sandbox mode on port ${PORT}`);
  });
});
