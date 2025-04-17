import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const BookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      start: { type: String, required: true }, // "HH:MM" format
      end: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed"],
      default: "pending",
    },
    meetingDetails: {
      platform: {
        type: String,
        enum: ["Zoom", "Google Meet", "Skype", "Other"],
        default: "Zoom",
      },
      link: {
        type: String,
        trim: true,
      },
      instructions: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookingSchema.plugin(normalize);

export const Booking = mongoose.model("Booking", BookingSchema);
