import express from "express";
const route = express.Router();

// user Register route
import {
  register,
  login,
  refresh,
  logout,
} from "../controller/authController.js";

route.post("/register", register);
route.post("/login", login);
route.post("/refresh", refresh);
route.post("/logout", logout);
export default route;
