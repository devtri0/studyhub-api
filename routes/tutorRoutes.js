import express from "express";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";
import {
  createTutorProfile,
  getTutorProfile,
  updateTutorProfile,
} from "../controllers/tutorController.js";
import { isVerifiedTutor } from "../middleware/auth.js";

const tutorRouter = express.Router();

tutorRouter.post(
  "/tutor/profile",
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized(["tutor", "admin"]),
  createTutorProfile
);
tutorRouter.get(
  "/tutor/profile/:userId",
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized(["tutor", "admin"]),
  getTutorProfile
);
tutorRouter.patch(
  "/tutor/profile/:userId",
  isAuthenticated,
  isAuthorized(["tutor", "admin"]),
  updateTutorProfile
);

export default tutorRouter;
