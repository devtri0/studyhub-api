import { Router } from "express";
import {
  getAuthenticatedUser,
  loginUser,
  registerUser,
  verifyEmail,
} from "../controllers/authController.js";
import { photo } from "../middleware/upload.js";
import { updateUserProfile } from "../controllers/updateUserController.js";
import { isAuthenticated } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/signup", registerUser);

authRouter.post("/login", loginUser);

authRouter.post("/verify-email", verifyEmail);

authRouter.get("/verify-email", verifyEmail);

authRouter.get("/users/me", isAuthenticated, getAuthenticatedUser);

authRouter.patch(
  "/update/profile",
  isAuthenticated,
  photo.single("photo"),
  updateUserProfile
);

// // Resend verification email
// authRouter.post("/resend-verification", resendVerificationEmail);

export default authRouter;
