import express from "express";
import { getCalendarController } from "../controllers/calendarController.js";

export const calendarRouter = express.Router();

calendarRouter.route("/")
  .get(getCalendarController);