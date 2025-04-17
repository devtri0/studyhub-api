import express from "express";
import { 
  createTutorAvailability,
  getTutorAvailability,
  updateTutorAvailability
} from "../controllers/tutorAvailabilityController.js";
import { isAuthenticated, isVerifiedTutor, isAuthorized } from "../middleware/auth.js";

const avaRouter = express.Router();

// Create availability (protected route)
avaRouter.post(
  "/tutor/ava",
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized(["tutor"]),
  createTutorAvailability
);

// Get availability (public route)
avaRouter.get("/tutor/ava/:userId", getTutorAvailability);

// Update availability (protected route)
avaRouter.patch(
  "/tutor/ava/:userId",
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized(["tutor"]),
  updateTutorAvailability
);

export default avaRouter;

