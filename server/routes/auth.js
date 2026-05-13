import express from "express";
import { registerUserController, loginUserController, 
  logoutController } from "../controllers/authController.js";


export const authRouter = express.Router();

authRouter.route("/register")
  .post(registerUserController)

authRouter.route("/login")
  .post(loginUserController)

authRouter.route("/logout")
  .delete(logoutController)
