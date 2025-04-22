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
        start: { type: String, required: true }, 
        end: { type: String, required: true }, 
      },
      weekends: {
        start: { type: String, required: true }, 
        end: { type: String, required: true }, 
      },
      notes: String, 
    },
    
    specificSlots: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        date: Number, 
        slots: [
          {
            start: { type: String, required: true }, 
            end: { type: String, required: true }, 
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


