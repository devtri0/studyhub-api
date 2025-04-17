import express from "express";
import cors from "cors";
import "dotenv/config";
import authRouter from "./routes/authRoutes.js";
import tutorRouter from "./routes/tutorRoutes.js";
import avaRouter from "./routes/tutorAvailabiltyRoute.js";
import styleRouter from "./routes/tutorStyleRoute.js";
import bookingRouter from "./routes/bookingRoutes.js";
import studentRouter from "./routes/studentRoutes.js";

// Database connection
import connectDB from "./config/db.js";
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(authRouter);
app.use(tutorRouter);
app.use(studentRouter);
app.use(avaRouter);
app.use(styleRouter);
app.use(bookingRouter);

export default app;
