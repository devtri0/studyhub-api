import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const BookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a student"],
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a tutor"],
    },
    subject: {
      type: String,
      required: [true, "Please specify the subject"],
    },
    date: {
      type: Date,
      required: [true, "Please provide booking date"],
    },
    startTime: {
      type: String,
      required: [true, "Please provide start time"],
    },
    endTime: {
      type: String,
      required: [true, "Please provide end time"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    meetingLink: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    amount: {
      type: Number,
      required: [true, "Please specify the amount"],
    },
  },
  {
    timestamps: true,
  }
);

BookingSchema.plugin(normalize);

export default mongoose.model("Booking", BookingSchema);
