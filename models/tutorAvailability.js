import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const tutorAvailabilitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    generalAvailability: {
      weekdays: {
        start: { type: String, required: true }, // "3 PM"
        end: { type: String, required: true }, // "8 PM"
      },
      weekends: {
        start: { type: String, required: true }, // "10 AM"
        end: { type: String, required: true }, // "5 PM"
      },
      notes: String, // "Get in touch if you need to discuss scheduling other times!"
    },
    
    specificSlots: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        date: Number, // Optional day number (e.g., Mon 1 = 1)
        slots: [
          {
            start: { type: String, required: true }, // "3 PM"
            end: { type: String, required: true }, // "4 PM"
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

tutorAvailabilitySchema.plugin(normalize);

export const TutorAvailability = mongoose.model(
  "TutorAvailability",
  tutorAvailabilitySchema
);


