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
} from "../controller/authController.js";
// import { logoutAllDevices } from "../services/authService.js";
import authenticate from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/authorizeMiddleware.js";

route.post("/register", register);
route.post("/login", login);
route.post("/refresh", refresh);
route.post("/logout", logout);

// Protected routes
route.get("/me", authenticate, getMe);

route.post("/logout-all", authenticate, logoutAll);

// admin route testing
route.get("/admin-test", authenticate, authorize("admin"), adminTest);
export default route;
