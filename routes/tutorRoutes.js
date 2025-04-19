import express from "express";
import { isAuthenticated, isAuthorized } from "../middleware/auth.js";
import {
  createTutorProfile,
  getAuthTutorInfo,
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

tutorRouter.get(
  "/tutors/me/:id",
  isAuthenticated,
  isAuthorized(["tutor", "admin"]),
  getAuthTutorInfo
);

export default tutorRouter;
