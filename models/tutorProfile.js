import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const tutorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    specialization: {
      type: [String],
      required: true,
    },
    languages: {
      type: [String],
      required: true,
    },
    education: {
      type: [String],
      required: true,
    },
    experience: {
      type: [String],
      required: true,
    },
    location: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      gpsAddress: {
        type: [String],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tutorProfileSchema.plugin(normalize);

export const tutorProfile = mongoose.model("Tutor", tutorProfileSchema);
