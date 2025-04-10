import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student must belong to a user"],
      unique: true,
    },
    educationLevel: {
      type: String,
      required: [true, "Please specify your education level"],
      enum: ["JHS", "SHS", "Tertiary"],
    },
    school: {
      type: String,
      required: [true, "Please provide your school name"],
      trim: true,
      maxlength: [100, "School name cannot exceed 100 characters"],
    },
    subjectsOfInterest: {
      type: [String],
      validate: {
        validator: (v) => !v || (Array.isArray(v) && v.length <= 10),
        message: "Cannot select more than 10 subjects",
      },
    },
    location: {
      city: {
        type: String,
        required: [true, "Please provide your city"],
      },
      region: {
        type: String,
        required: [true, "Please provide your region"],
        enum: regions,
      },
    },
    learningGoals: {
      type: String,
      maxlength: [300, "Learning goals cannot exceed 300 characters"],
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.plugin(normalize);

export default mongoose.model("Student", StudentSchema);
