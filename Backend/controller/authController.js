// import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

import refreshTokenCookieOptions from "../utils/cookieOptions.js";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  logoutAllDevices,
  verifyEmail,
  resendVerificationEmail,
} from "../services/authService.js";
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

// LOGIN USER

/**

* Login User
* POST /api/v1/auth/login
  */
export const login = globalAsyncHandler(async (req, res) => {
  const userData = req.body;

  // Request metadata
  const metadata = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };

  // Login user
  const { user, accessToken, refreshToken } = await loginUser(
    userData,
    metadata,
  );

  // Store refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

  // Send response
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        accessToken,
      },
      "Login successful",
    ),
  );
});

// refreshAccessToken rotation

export const refresh = globalAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const metadata = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshAccessToken(refreshToken, metadata);

  res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken,
      },
      "Token refreshed successfully",
    ),
  );
});

// logoutUser controller logic

export const logout = globalAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

// logoutUser from all devices controller logic

export const logoutAll = globalAsyncHandler(async (req, res) => {
  const userId = req.user._id;

  await logoutAllDevices(userId);

  res.clearCookie("refreshToken", refreshTokenCookieOptions);

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Logged out from all devices successfully"),
    );
});

// getMe Profile test controller logic

export const getMe = globalAsyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: req.user,
      },
      "User retrieved successfully",
    ),
  );
});

// admin test controller logic
export const adminTest = globalAsyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
      "Admin access granted",
    ),
  );
});

// email verification controller logic
export const verifyEmailController = globalAsyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await verifyEmail(token);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
      "Email verified successfully",
    ),
  );
});

// resend email verification controller logic
export const resendVerification = globalAsyncHandler(async (req, res) => {
  const { email } = req.body;
  //   console.log("Resend verification email request received for:", email);

  await resendVerificationEmail(email);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "If an account exists with this email, a verification email has been sent",
      ),
    );
});
