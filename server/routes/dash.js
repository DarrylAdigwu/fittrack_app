import express from "express";
import { deleteWorkoutsController, getWorkoutsController, 
  postWorkoutsController, updateWorkoutsController } from "../controllers/dashController.js";
import { requireAuth } from "../server-utils.js";

export const dashRouter = express.Router();

dashRouter.route("/:username")
  .get(requireAuth, getWorkoutsController);

dashRouter.route("/:username")
  .post(requireAuth, postWorkoutsController);

dashRouter.route("/:username")
  .put(requireAuth, updateWorkoutsController);

dashRouter.route("/:username")
  .delete(requireAuth, deleteWorkoutsController)