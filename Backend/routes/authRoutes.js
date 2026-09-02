import express from "express";
const route = express.Router();

// user Register route
import { register, login, refresh } from "../controller/authController.js";

route.post("/register", register);
route.post("/login", login);
route.post("/refresh", refresh);
export default route;
