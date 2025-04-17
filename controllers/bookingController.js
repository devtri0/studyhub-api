import { Booking } from "../models/booking.js";
import { User } from "../models/user.js";
import { sendEmail } from "../utils/mailing.js";
import { createBookingValidator, updateBookingValidator } from "../validators/bookingValidation.js";


// Create a new booking
export const createBooking = async (req, res) => {
  try {
    // Validate request body (student and tutor will be injected later)
    const { error, value } = createBookingValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    const { subject, date, timeSlot, meetingDetails } = value;
    const { tutorId } = req.params;
    const studentId = req.auth?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Student ID not found in auth context."
      });
    }

    // Verify tutor exists and is actually a tutor
    const tutor = await User.findOne({ _id: tutorId, role: "tutor" });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found or is not a registered tutor",
      });
    }

    // Check for existing bookings at the same time
    const existingBooking = await Booking.findOne({
      tutor: tutorId,
      date,
      "timeSlot.start": timeSlot.start,
      "timeSlot.end": timeSlot.end,
      status: { $nin: ["cancelled", "rejected"] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Time slot already booked",
        conflictingBooking: {
          id: existingBooking._id,
          date: existingBooking.date,
          time: `${existingBooking.timeSlot.start}-${existingBooking.timeSlot.end}`
        }
      });
    }

    // Create new booking
    const bookingPayload = {
      student: studentId,
      tutor: tutorId,
      subject,
      date,
      timeSlot,
      meetingDetails,
      status: "pending"
    };

    const newBooking = await Booking.create(bookingPayload);

    const student = await User.findById(studentId);

    // Notify student
    await sendEmail(
      student.email,
      "Booking Request Sent",
      `Your booking request with ${tutor.firstName} ${tutor.lastName} for ${subject} has been sent.`
    );

    // Notify tutor
    await sendEmail(
      tutor.email,
      "New Booking Request",
      `You have a new booking request from ${student.firstName} ${student.lastName} for ${subject} on ${date} from ${timeSlot.start} to ${timeSlot.end}.`
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: newBooking._id,
        tutor: {
          id: tutor._id,
          name: `${tutor.firstName} ${tutor.lastName}`,
          email: tutor.email
        },
        subject,
        date,
        time: `${timeSlot.start}-${timeSlot.end}`,
        status: "pending",
        createdAt: newBooking.createdAt
      }
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating booking",
      error: error.message
    });
  }
};


export const updateBookingStatus = async (req, res) => {
  try {
    // Validate request body
    const { error, value } = updateBookingValidator.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(e => e.message),
      });
    }

    const { status, meetingLink } = value;
    const { bookingId } = req.params;

    // Find the booking and populate tutor & student info
    const booking = await Booking.findById(bookingId)
      .populate("student", "firstName lastName email")
      .populate("tutor", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Update status and optionally meeting link
    booking.status = status;
    if (meetingLink) {
      booking.meetingDetails.link = meetingLink;
    }

    await booking.save();

    // Email notification
    const recipient = booking.student;
    const actor = booking.tutor;

    await sendEmail(
      recipient.email,
      `Booking ${status}`,
      `Your booking for ${booking.subject} has been ${status} by ${actor.firstName}.`
    );

    // Final response
    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt,
        meetingLink: booking.meetingDetails?.link || null,
      },
    });

  } catch (error) {
    console.error("Booking update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


  
  // Get user's bookings
  export const getUserBookings = async (req, res) => {
    try {
      const userId = req.auth._id;
      const { status, page = 1, limit = 10 } = req.query;
  
      const query = {
        $or: [{ student: userId }, { tutor: userId }],
        ...(status ? { status } : {})
      };
  
      const bookings = await Booking.find(query)
        .populate("student", "firstName lastName email")
        .populate("tutor", "firstName lastName email")
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
      const total = await Booking.countDocuments(query);
  
      res.status(200).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings.map(booking => ({
          id: booking._id,
          tutor: {
            id: booking.tutor._id,
            name: `${booking.tutor.firstName} ${booking.tutor.lastName}`
          },
          student: {
            id: booking.student._id,
            name: `${booking.student.firstName} ${booking.student.lastName}`
          },
          subject: booking.subject,
          date: booking.date,
          time: `${booking.timeSlot.start}-${booking.timeSlot.end}`,
          status: booking.status,
          meetingLink: booking.meetingLink || null,
          createdAt: booking.createdAt
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
  
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while retrieving bookings",
        error: error.message
      });
    }
  };
  