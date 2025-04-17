import { tutorProfile } from "../models/tutorProfile.js";
import { tutorProfileUpdateValidator, tutorProfileValidator, } from "../validators/tutorValidation.js";


// create tutor profile: 1st section
export const createTutorProfile = async (req, res) => {
  try {
    const { error, value } = tutorProfileValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Check if tutor profile already exists for this user
    const existingTutor = await tutorProfile.findOne({ user: req.auth.id });
    if (existingTutor) {
      return res.status(409).json({
        success: false,
        message: "Tutor profile already exists for this user",
      });
    }

    // Create new tutor profile with authenticated user's ID
    const newTutor = await tutorProfile.create({
      ...value,
      user: req.auth.id
    });

    res.status(201).json({
      success: true,
      message: "Tutor profile created successfully",
      data: newTutor,
    });
  } catch (error) {
    console.error("Create tutor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Get tutor profile (accessible to owner or admin)
export const getTutorProfile = async (req, res) => {
  try {
    const tutor = await tutorProfile.findOne({ user: req.params.userId })
      .populate('user', 'firstName lastName email photo');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tutor,
    });
  } catch (error) {
    console.error("Get tutor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Update tutor profile (only by profile owner)
export const updateTutorProfile = async (req, res) => {
  try {
    const { error, value } = tutorProfileUpdateValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // First find the tutor profile to check ownership
    const tutor = await tutorProfile.findOne({ user: req.params.userId });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor profile not found",
      });
    }

    // Verify the requesting user owns this profile
    if (tutor.user.toString() !== req.auth.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own profile"
      });
    }

    const updatedTutor = await tutorProfile.findOneAndUpdate(
      { user: req.params.userId },
      value,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Tutor profile updated successfully",
      data: updatedTutor,
    });
  } catch (error) {
    console.error("Update tutor profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};