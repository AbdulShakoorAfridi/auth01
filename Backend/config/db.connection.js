import mongoose from "mongoose";
import { env } from "./env.js";

const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.DATA_BASE_URL);
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
