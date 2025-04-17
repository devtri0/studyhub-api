import { User } from "../models/user.js";
import { updateUserValidator } from "../validators/userValidation.js";

export const updateUserProfile = async (req, res) => {
  try {
    if (!req.auth || !req.auth.id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Validate input
    const { error, value } = updateUserValidator.validate({
      ...req.body,
      photo: req.file?.filename,
    });

    if (error) {
      return res.status(422).json({ message: error.message });
    }

    // Extract validated data
    const { firstName, lastName, phone } = value;
    const photo = req.file ? req.file.path : value.photo;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.auth.id,
      { $set: { firstName, lastName, phone, photo } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
