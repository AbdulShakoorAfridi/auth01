import rateLimit from "express-rate-limit";

// Rate limiting middleware for login route
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    statusCode: 429,
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// Rate limiting middleware for forgot password route

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 5,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    statusCode: 429,
    success: false,
    message: "Too many password reset requests. Please try again later.",
  },
});

// Rate limiting middleware for resetPassword route
export const resetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 10,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    statusCode: 429,
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
});

// Rate limiting middleware for refresh token route
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 30,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    statusCode: 429,
    success: false,
    message: "Too many token refresh requests. Please try again later.",
  },
});
