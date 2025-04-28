import { Booking } from "../models/booking.js";
import { User } from "../models/user.js";
import { sendEmail } from "../utils/mailing.js";
import { createBookingValidator, updateBookingValidator } from "../validators/bookingValidation.js";

export const createBooking = async (req, res) => {
  try {
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
        message: "Unauthorized. Student ID not found in auth context.",
      });
    }

    // 🛠 FIXED: Use `_id` instead of `id`
    const tutor = await User.findOne({ _id: tutorId, role: "tutor" });
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found or is not a registered tutor",
      });
    }

    const existingBooking = await Booking.findOne({
      tutor: tutorId,
      date,
      "timeSlot.start": timeSlot.start,
      "timeSlot.end": timeSlot.end,
      status: { $nin: ["cancelled", "rejected"] },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Time slot already booked",
        conflictingBooking: {
          id: existingBooking._id,
          date: existingBooking.date,
          time: `${existingBooking.timeSlot.start}-${existingBooking.timeSlot.end}`,
        },
      });
    }

    const bookingPayload = {
      student: studentId,
      tutor: tutorId, // 🛠 No issues here — passed from req.params
      subject,
      date,
      timeSlot,
      meetingDetails,
      status: "pending",
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
      `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <title>New Booking Request Notification</title>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #001f3f; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 8px 8px; border: 1px solid #e1e1e1; }
              .booking-details { background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #001f3f; }
              .detail-row { margin-bottom: 10px; }
              .detail-label { font-weight: bold; color: #001f3f; display: inline-block; width: 120px; }
              .cta-button { display: inline-block; background-color: #001f3f; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
              .student-info { background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>TutorConnect - New Booking Request</h1>
              </div>
              <div class="content">
                  <p>Hello ${tutor.firstName},</p>
                  <div class="student-info">
                      <p><strong>You have a new booking request from:</strong></p>
                      <p>${student.firstName} ${student.lastName} (${student.email})</p>
                  </div>
                  <div class="booking-details">
                      <h2 style="color: #001f3f; margin-top: 0;">Booking Details</h2>
                      <div class="detail-row">
                          <span class="detail-label">Subject:</span>
                          <span>${subject}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Date:</span>
                          <span>${new Date(date).toLocaleDateString()}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Time:</span>
                          <span>${timeSlot.start} - ${timeSlot.end}</span>
                      </div>
                      <div class="detail-row">
                          <span class="detail-label">Meeting Platform:</span>
                          <span>${meetingDetails?.platform || 'Zoom'}</span>
                      </div>
                      ${meetingDetails?.link ? `
                      <div class="detail-row">
                          <span class="detail-label">Meeting Link:</span>
                          <span><a href="${meetingDetails.link}" target="_blank">Join Meeting</a></span>
                      </div>
                      ` : ''}
                      ${meetingDetails?.instructions ? `
                      <div class="detail-row">
                          <span class="detail-label">Instructions:</span>
                          <span>${meetingDetails.instructions}</span>
                      </div>
                      ` : ''}
                  </div>
                  <p>Please respond to this booking request at your earliest convenience.</p>
                  <center>
                      <a href="https://tutorkonnet.netlify.app/login" class="cta-button">
                          View Booking in Dashboard
                      </a>
                  </center>
                  <p>Best regards,<br>The StudyHub Team</p>
                  <div class="footer">
                      <p>© ${new Date().getFullYear()} StudyHub. All rights reserved.</p>
                      <p>If you didn't request this booking, please <a href="mailto:support@studyhub.com">contact support</a>.</p>
                  </div>
              </div>
          </div>
      </body>
      </html>
      `
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: newBooking._id,
        tutor: {
          id: tutor._id,
          name: `${tutor.firstName} ${tutor.lastName}`,
          email: tutor.email,
        },
        subject,
        date,
        time: `${timeSlot.start}-${timeSlot.end}`,
        status: "pending",
        createdAt: newBooking.createdAt,
      },
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating booking",
      error: error.message,
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
      const userId = req.auth.id;
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
          id: booking.id,
          tutor: {
            id: booking.tutor.id,
            name: `${booking.tutor.firstName} ${booking.tutor.lastName}`
          },
          student: {
            id: booking.student.id,
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

  // export const getTutorBookings = async (req, res) => {
  //   try {
  //     // Get ALL bookings temporarily
  //     const allBookings = await Booking.find()
  //       .populate('student tutor')
  //       .lean();
      
  //     // Filter manually
  //     const filtered = allBookings.filter(b => 
  //       b.tutor?.id?.toString() === req.params.userId || 
  //       b.tutor?.toString() === req.params.userId
  //     );
      
  //     res.json({
  //       success: true,
  //       count: filtered.length,
  //       data: filtered
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: error.toString() });
  //   }
  // };

  export const getStudentBookings = async (req, res) => {
    try {
      console.log('Filtering by student ID:', req.params.studentId);
  
      const allBookings = await Booking.find()
        .populate('student tutor')
        .sort({ date: -1, 'timeSlot.start': 1 })
        .lean();
  
      console.log('All Bookings:', allBookings);
  
      const studentBookings = allBookings.filter(b =>
        b.student && b.student._id.toString() === req.params.studentId
      );
  
      const categorizedBookings = {
        upcoming: studentBookings.filter(b =>
          new Date(b.date) >= new Date() && 
          b.status !== 'completed' && 
          b.status !== 'rejected'
        ),
        completed: studentBookings.filter(b => b.status === 'completed'),
        pending: studentBookings.filter(b => b.status === 'pending'),
        rejected: studentBookings.filter(b => b.status === 'rejected')
      };
  
      res.status(200).json({
        success: true,
        count: studentBookings.length,
        data: categorizedBookings
      });
    } catch (error) {
      console.error('Error fetching student bookings:', error);
      res.status(500).json({ 
        success: false,
        error: 'Server error while fetching bookings' 
      });
    }
  };
  