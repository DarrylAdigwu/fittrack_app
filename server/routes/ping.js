import express from "express";
import { sendPingController } from "../controllers/pingController";

export const pingRouter = express.Router();

pingRouter.route("/")
  .get(sendPingController);