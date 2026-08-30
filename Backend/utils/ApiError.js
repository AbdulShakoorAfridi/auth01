class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;

// usage example
// throw new ApiError(401, "Invalid credentials");
// throw new ApiError(400, "Bad Request", ["Invalid input data"]);
