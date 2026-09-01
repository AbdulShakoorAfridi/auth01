import express from "express";
const route = express.Router();

// user Register route
import { register } from "../controller/authController.js";
route.post("/register", register);

export default route;
