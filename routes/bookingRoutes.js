import express from "express";
import {
  isAuthenticated,
  isAuthorized,
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

// bookingRouter.get("/tutor/bookings/:Id", isAuthenticated, getTutorBookings);

// Get user's bookings
bookingRouter.get("/bookings", isAuthenticated, getUserBookings);

export default bookingRouter;
