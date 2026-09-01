import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiError from "../utils/ApiError.js";

/**

* Generate Access Token
* Short-lived token used to access protected routes
  */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
    },
  );
};

/**

* Generate Refresh Token
* Long-lived token used to generate new access tokens
  */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    },
  );
};

/**

* Verify Access Token
  */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired access token");
  }
};

/**

* Verify Refresh Token
  */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
};

/**

* Hash Refresh Token
* We never store the raw refresh token in the database
  */
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**

Decode token without verification
Used internally to read token expiry
*/
export const getTokenExpiry = (token) => {
  const decoded = jwt.decode(token);

  if (!decoded || !decoded.exp) {
    throw new ApiError(500, "Unable to determine token expiry");
  }

  return new Date(decoded.exp * 1000);
};
