import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import notFound from "../middlewares/notFoundMiddleware.js";
import errorHandler from "../middlewares/globalErrorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get("/", (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { name: "My App", version: "1.0.0" },
        "Server is running successfully",
      ),
    );
});

app.use(notFound);
app.use(errorHandler);

export default app;
