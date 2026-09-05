import { env } from "../config/env.js";

// const errorHandler = (err, req, res, next) => {
//   let statusCode = err.statusCode || 500;
//   let message = err.message || "Internal Server Error";

//   // MongoDB Duplicate Key
//   if (err.code === 11000) {
//     statusCode = 409;
//     message = "Resource already exists";
//   }

//   // Mongoose Validation Error
//   if (err.name === "ValidationError") {
//     statusCode = 400;
//     message = Object.values(err.errors)
//       .map((item) => item.message)
//       .join(", ");
//   }

//   // JWT Error
//   if (err.name === "JsonWebTokenError") {
//     statusCode = 401;
//     message = "Invalid authentication token";
//   }

//   // JWT Expired
//   if (err.name === "TokenExpiredError") {
//     statusCode = 401;
//     message = "Authentication token expired";
//   }

//   console.error(err);

//   res.status(statusCode).json({
//     success: false,
//     message,
//     ...(process.env.NODE_ENV === env.nodeEnv && {
//       stack: err.stack,
//     }),
//   });
// };

// export default errorHandler;

// improved version

import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((item) => item.message);

    error = new ApiError(400, "Validation failed", errors);
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});

    error = new ApiError(409, `${fields.join(", ")} already exists`);
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}`);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid authentication token");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Authentication token has expired");
  }

  const statusCode = error.statusCode || 500;

  const message = error.message || "Internal server error";

  const response = {
    statusCode,
    success: false,
    message,
  };

  // Include validation details when available.
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Development only
  if (process.env.NODE_ENV !== "production") {
    response.stack = error.stack;
  }

  logger.error({
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json(response);
};

export default errorHandler;
