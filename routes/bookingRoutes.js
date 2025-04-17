import express from "express";
import {
  isAuthenticated,
  isAuthorized,
  isVerifiedTutor,
} from "../middleware/auth.js";
import {
  createBooking,
  getUserBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

// All routes require authentication
bookingRouter.use(isAuthenticated);

// Book a specific tutor
bookingRouter.post(
  "/book/:tutorId",
  isAuthorized(["tutor", "student"]),
  createBooking
);

// Manage booking status
bookingRouter.patch(
  "/manage/:bookingId",
  isAuthorized(["tutor", "student"]),
  updateBookingStatus
);

// Get user's bookings
bookingRouter.get("/bookings", getUserBookings);

export default bookingRouter;
