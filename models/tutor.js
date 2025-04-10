import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const tutorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Tutor must belong to a user"],
      unique: true,
    },
    subjects: {
      type: [String],
      required: [true, "Please add at least one subject"],
    },
    levels: {
      type: [String],
      required: [true, "Please specify education levels"],
    },
    qualifications: {
      type: [String],
      required: [true, "Please add qualifications"],
    },
    experience: {
      type: Number,
      required: [true, "Please add years of experience"],
    },
    hourlyRate: {
      type: Number,
      required: [true, "Please add an hourly rate"],
    },
    availability: [
      {
        day: String,
        times: [String],
      },
    ],
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: {
        type: [GPS],
        required: true,
      },
      address: String,
      city: String,
      region: String,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1.0"],
      max: [5, "Rating must not exceed 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

tutorSchema.index({ location: "2dsphere" });

tutorSchema.plugin(normalize);

export default mongoose.model("Tutor", tutorSchema);
