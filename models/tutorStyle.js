import mongoose from "mongoose";
import normalize from "normalize-mongoose";

const tutorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    teachingStyle: {
      type: String,
      required: true,
      enum: [
        "Student-Centered",
        "Interactive Methods",
        "Engaging Methods",
        "Personalized Approaches",
        "Knowledge Empowerment",
        "Visual Learning",
        "Hands-on Practice",
        "Discussion Based",
        "Problem Solving",
        "Lecture Style",
        "Game Based"
      ],
    },
    subjects: [
      {
        name: {
          type: String,
          required: true,
          enum: [
            "Mathematics",
            "English",
            "Science",
            "Social Studies",
            "ICT",
            "Integrated Science",
            "Physics",
            "Chemistry",
            "Biology",
            "Economics",
            "Accounting",
            "Business",
            "Geography",
            "History",
            "Government",
            "French",
            "Ga",
            "Twi",
            "Ewe",
            "Fante",
            "Other",
          ],
        },
        level: {
          type: String,
          enum: ["JHS", "SHS", "Tertiary"],
          default: "SHS",
        },
      },
    ],
  },
  { timestamps: true }
);

tutorSchema.plugin(normalize);

export const TutorStyle = mongoose.model("Tutor-Style", tutorSchema);
