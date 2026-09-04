import RefreshToken from "../models/refreshToken.Model.js";
import User from "../models/user.Model.js";
import ApiError from "../utils/ApiError.js";
import { generateRandomToken } from "../utils/generateEmailVerificationToken.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  getTokenExpiry,
  verifyRefreshToken,
} from "./tokenService.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./emailService.js";

/**

* Register a new user
  */
export const registerUser = async (userData, metadata = {}) => {
  const { name, email, password } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  // Create user
  // Password hashing happens automatically
  // in the User model pre-save middleware
  const user = await User.create({
    name,
    email,
    password,
  });

  // email verification token generation

  const verificationToken = await createEmailVerificationToken(user);

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationUrl,
  });

  // Generate access token
  const accessToken = generateAccessToken(user);

  // Generate refresh token
  const refreshToken = generateRefreshToken(user);

  // Hash refresh token before storing
  const tokenHash = hashToken(refreshToken);

  // Calculate refresh token expiry date
  // const decodedRefreshToken = JSON.parse(
  //   Buffer.from(refreshToken.split(".")[1], "base64").toString(),
  // );

  // const expiresAt = new Date(decodedRefreshToken.exp * 1000);

  const expiresAt = getTokenExpiry(refreshToken);

  // Create refresh token session
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,

    device: metadata.device || null,
    ipAddress: metadata.ipAddress || null,
    userAgent: metadata.userAgent || null,
  });

  // Remove sensitive fields
  const safeUser = user.toObject();

  delete safeUser.password;
  delete safeUser.passwordResetToken;
  delete safeUser.passwordResetExpires;
  delete safeUser.emailVerificationToken;
  delete safeUser.emailVerificationExpires;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

// LOGIN SERVICE
/**

* Login user
  */
export const loginUser = async (userData, metadata = {}) => {
  const { email, password } = userData;

  // Find user and explicitly include password
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  // Prevent account enumeration
  // Same error whether email or password is incorrect
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Check if account is active
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // Compare passwords
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Hash refresh token before storing
  const tokenHash = hashToken(refreshToken);

  // Get refresh token expiry
  const expiresAt = getTokenExpiry(refreshToken);

  // Create new session
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,

    device: metadata.device || null,
    ipAddress: metadata.ipAddress || null,
    userAgent: metadata.userAgent || null,
  });

  // Convert user to plain object
  const safeUser = user.toObject();

  // Remove sensitive fields
  delete safeUser.password;
  delete safeUser.passwordResetToken;
  delete safeUser.passwordResetExpires;
  delete safeUser.emailVerificationToken;
  delete safeUser.emailVerificationExpires;
  delete safeUser.__v;

  return {
    user: safeUser,
    accessToken,
    refreshToken,
  };
};

// refreshAccessTokenService refresh token rotation

export const refreshAccessToken = async (refreshToken, metadata = {}) => {
  // 1. Verify refresh token JWT
  const decoded = verifyRefreshToken(refreshToken);

  // 2. Hash the raw token
  const tokenHash = hashToken(refreshToken);

  // 3. Find token in database
  const storedToken = await RefreshToken.findOne({
    tokenHash,
  }).select("+tokenHash");

  if (!storedToken) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // 4. Detect token reuse
  if (storedToken.revoked) {
    // Security measure:
    // revoke all sessions belonging to this user
    await RefreshToken.updateMany(
      {
        userId: storedToken.userId,
        revoked: false,
      },
      {
        $set: {
          revoked: true,
          revokedAt: new Date(),
        },
      },
    );

    throw new ApiError(
      401,
      "Refresh token reuse detected. Please log in again.",
    );
  }

  // 5. Check expiration
  if (storedToken.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token expired");
  }

  // 6. Make sure token belongs to the JWT user
  if (storedToken.userId.toString() !== decoded.sub) {
    throw new ApiError(401, "Invalid refresh token");
  }

  // 7. Get user
  const user = await User.findById(storedToken.userId);

  if (!user) {
    throw new ApiError(401, "User account no longer exists");
  }

  // 8. Check account status
  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // 9. Revoke old refresh token
  storedToken.revoked = true;
  storedToken.revokedAt = new Date();

  // 10. Generate new tokens
  const newAccessToken = generateAccessToken(user);

  const newRefreshToken = generateRefreshToken(user);

  // 11. Hash new refresh token
  const newTokenHash = hashToken(newRefreshToken);

  const newExpiresAt = getTokenExpiry(newRefreshToken);

  // 12. Store new refresh token
  const newStoredToken = await RefreshToken.create({
    userId: user._id,
    tokenHash: newTokenHash,
    expiresAt: newExpiresAt,
    device: metadata.device || null,
    ipAddress: metadata.ipAddress || null,
    userAgent: metadata.userAgent || null,
  });

  // 13. Link old token → new token
  storedToken.replacedByToken = newStoredToken._id;

  await storedToken.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// Logout user
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);

  await RefreshToken.findOneAndUpdate(
    { tokenHash },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    },
  );
};

// logoutUser from all the devices

export const logoutAllDevices = async (userId) => {
  await RefreshToken.updateMany(
    {
      userId,
      revoked: false,
    },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    },
  );
};

// email verification token generation service
export const createEmailVerificationToken = async (user) => {
  const rawToken = generateRandomToken(32);
  const hashedToken = hashToken(rawToken);
  user.emailVerificationToken = hashedToken;

  // Token valid for 15 minutes
  user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({
    validateBeforeSave: false,
  });

  return rawToken;
};

// verifying email verification token service

export const verifyEmail = async (token) => {
  if (!token) {
    throw new ApiError(400, "Verification token is required");
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: {
      $gt: new Date(),
    },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    throw new ApiError(400, "Invalid or expired verification token");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  user.isEmailVerified = true;

  // Destroy token immediately.
  // This makes it single-use.
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  return user;
};

// resend email verification token service
export const resendVerificationEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+emailVerificationToken +emailVerificationExpires");

  // console.log(
  //   user
  //     ? `Resend verification email request received for: ${normalizedEmail}`
  //     : `No user found for email: ${normalizedEmail}`,
  // );

  /*
   * Don't reveal whether the account exists.
   * The controller will return the same response either way.
   */

  if (!user) {
    return;
  }

  // Already verified
  if (user.isEmailVerified) {
    // console.log("Email is already verified...........");
    return;
  }

  // Generate completely new token
  const rawToken = generateRandomToken(32);

  // Store only hash
  user.emailVerificationToken = hashToken(rawToken);

  // New token valid for 15 minutes
  user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({
    validateBeforeSave: false,
  });

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

  await sendVerificationEmail({
    email: user.email,
    name: user.name,
    verificationUrl,
  });
};

//forgot password service

export const forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordResetToken +passwordResetExpires");

  // IMPORTANT:
  // Never tell the client whether the email exists.
  if (!user) {
    return;
  }

  // Don't reset passwords for inactive accounts.
  if (!user.isActive) {
    return;
  }

  const rawToken = generateRandomToken(32);

  const hashedToken = hashToken(rawToken);

  user.passwordResetToken = hashedToken;

  user.passwordResetExpires = new Date(Date.now() + 5 * 60 * 1000);

  await user.save({
    validateBeforeSave: false,
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl,
  });
};

// reset password service
export const resetPassword = async (token, newPassword) => {
  if (!token) {
    throw new ApiError(400, "Password reset token is required");
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: new Date(),
    },
  }).select("+passwordResetToken +passwordResetExpires +password");

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // Set the new password.
  // Your pre-save middleware will hash it.
  user.password = newPassword;

  // Make token single-use.
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Invalidate all existing refresh sessions.
  await RefreshToken.updateMany(
    {
      userId: user._id,
      revoked: false,
    },
    {
      $set: {
        revoked: true,
        revokedAt: new Date(),
      },
    },
  );
};
