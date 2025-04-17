import { TutorAvailability } from "../models/tutorAvailability.js";
import {
  tutorAvailabilityValidator,
  tutorAvailabilityUpdateValidator,
} from "../validators/tutorValidation.js";

// Create tutor availability
export const createTutorAvailability = async (req, res) => {
  try {
    const { error, value } = tutorAvailabilityValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // Check if availability already exists for this user
    const existingAvailability = await TutorAvailability.findOne({
      user: req.auth.id,
    });
    if (existingAvailability) {
      return res.status(409).json({
        success: false,
        message: "Availability schedule already exists for this tutor",
      });
    }

    // Create new availability with authenticated user's ID
    const newAvailability = await TutorAvailability.create({
      ...value,
      user: req.auth.id,
    });

    res.status(201).json({
      success: true,
      message: "Availability schedule created successfully",
      data: newAvailability,
    });
  } catch (error) {
    console.error("Create availability error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get tutor availability (accessible to owner or admin)
export const getTutorAvailability = async (req, res) => {
  try {
    const availability = await TutorAvailability.findOne({
      user: req.params.userId,
    }).populate("user", "firstName lastName");

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update tutor availability (only by owner)
export const updateTutorAvailability = async (req, res) => {
  try {
    const { error, value } = tutorAvailabilityUpdateValidator.validate(
      req.body
    );
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    // First find the availability to check ownership
    const availability = await TutorAvailability.findOne({
      user: req.params.userId,
    });
    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Availability schedule not found",
      });
    }

    // Verify the requesting user owns this availability
    if (availability.user.toString() !== req.auth.id) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own availability schedule",
      });
    }

    const updatedAvailability = await TutorAvailability.findOneAndUpdate(
      { user: req.params.userId },
      value,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Availability schedule updated successfully",
      data: updatedAvailability,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
