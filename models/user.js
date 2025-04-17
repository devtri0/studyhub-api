import { Schema, model } from "mongoose";
import normalize from "normalize-mongoose";

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
    },

    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      requred: [true, "Please provide your phone number"],
      unique: true,
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlenght: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "tutor", "admin"],
      default: "student",
    },

    photo: { type: String, default: "default.jpg" },

    isVerified: { type: Boolean, default: false },

    verificationToken: {
      type: String,
      select: false, 
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.plugin(normalize);

export const User = model("User", UserSchema);
