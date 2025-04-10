import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const StudyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a group name"],
      trim: true,
      maxlength: [50, "Group name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot exceed 300 characters"],
    },
    subject: {
      type: String,
      required: [true, "Please specify the subject"],
      enum: subjects,
    },
    educationLevel: {
      type: String,
      required: [true, "Please specify education level"],
      enum: ["JHS", "SHS", "Tertiary"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Group must have a creator"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: (v) => Array.isArray(v) && v.length <= 20,
          message: "Study group cannot exceed 20 members",
        },
      },
    ],
    meetings: [
      {
        date: {
          type: Date,
          required: [true, "Please provide meeting date"],
        },
        time: {
          type: String,
          required: [true, "Please provide meeting time"],
        },
        location: {
          type: String,
          required: [true, "Please provide meeting location"],
        },
        agenda: {
          type: String,
          maxlength: [200, "Agenda cannot exceed 200 characters"],
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    region: {
      type: String,
      enum: regions,
    },
  },
  {
    timestamps: true,
  }
);

StudyGroupSchema.plugin(normalize);

export default mongoose.model("StudyGroup", StudyGroupSchema);
