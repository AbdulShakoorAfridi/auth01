import User from "../models/user.Model.js";
import { verifyAccessToken } from "../services/tokenService.js";
import ApiError from "../utils/ApiError.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken) {
      throw new ApiError(401, "Authentication required");
    }

    // Verify JWT
    const decoded = verifyAccessToken(accessToken);

    // Find user
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    // Check account status
    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;
