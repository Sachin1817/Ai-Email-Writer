import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ai-email-writer";
    
    // Set strictQuery to prepare for Mongoose upgrades
    mongoose.set("strictQuery", false);

    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In local development, we won't crash the server, just log the warning
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
