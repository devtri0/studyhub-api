import express from "express";
import {
  createTutorStyle,
  getTutorStyle,
  updateTutorStyle,
} from "../controllers/tutorStyleController.js";
import {
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized,
} from "../middleware/auth.js";

const styleRouter = express.Router();

styleRouter.post(
  "/tutor/style",
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized(["tutor", "admin"]),
  createTutorStyle
);
styleRouter.get("/tutor/style/:userId", getTutorStyle);

styleRouter.patch(
  "/tutor/style/:userId",
  isAuthenticated,
  isVerifiedTutor,
  isAuthorized(["tutor", "admin"]),
  updateTutorStyle
);

export default styleRouter;
