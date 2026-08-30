class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;

// usage example
// return new ApiResponse(200, { user: userData }, "User retrieved successfully");
// return new ApiResponse(404, null, "User not found");

// res.status(200).json(new ApiResponse(200, { user: userData }, "User retrieved successfully"));
