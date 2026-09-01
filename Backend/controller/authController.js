// import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import refreshTokenCookieOptions from "../utils/cookieOptions.js";

import { registerUser } from "../services/authService.js";
import globalAsyncHandler from "../middlewares/asyncHandles.js";

/**

* Register User
* POST /api/v1/auth/register
  */
export const register = globalAsyncHandler(async (req, res) => {
  const userData = req.body;

  // Get request metadata
  const metadata = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };

  // Register user
  const { user, accessToken, refreshToken } = await registerUser(
    userData,
    metadata,
  );

  // Store refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  // Return response
  res.status(201).json(
    new ApiResponse(
      201,
      {
        user,
        accessToken,
      },
      "User registered successfully",
    ),
  );
});
