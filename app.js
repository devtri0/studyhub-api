import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

// Database connection
import connectDB from "./config/db.js";
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Error handling middleware


export default app;
