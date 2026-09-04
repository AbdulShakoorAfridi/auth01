import express from "express";
const route = express.Router();

// user Register route
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  logoutAll,
  adminTest,
  verifyEmailController,
  resendVerification,
  forgotPasswordController,
  resetPasswordController,
} from "../controller/authController.js";
// import { logoutAllDevices } from "../services/authService.js";
import authenticate from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorizeMiddleware.js";

route.post("/register", register);

route.post("/resend-verification", resendVerification);

route.post("/login", login);
route.post("/refresh", refresh);
route.post("/logout", logout);

// Protected routes
route.get("/me", authenticate, getMe);

route.post("/logout-all", authenticate, logoutAll);

// admin route testing
route.get("/admin-test", authenticate, authorize("admin"), adminTest);
export default route;

// email verification route
route.get("/verify-email/:token", verifyEmailController);

// forgot password route
route.post("/forgot-password", forgotPasswordController);

// reset password route
route.post("/reset-password/:token", resetPasswordController);
