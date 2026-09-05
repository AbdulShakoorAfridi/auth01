import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.DATA_BASE_URL);
    const conn = await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
