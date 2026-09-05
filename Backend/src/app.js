import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import notFound from "../middlewares/notFoundMiddleware.js";
import errorHandler from "../middlewares/globalErrorHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import authRoutes from "../routes/authRoutes.js";

const allowedOrigins = [process.env.CLIENT_URL];
const app = express();
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "10kb",
  }),
);
app.use(cookieParser());
app.set("trust proxy", 1);
// app.use(cors({ origin: allowedOrigins }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // such as Postman/server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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

// API Routes
app.use("/api/v1/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
