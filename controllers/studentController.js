import mongoose from 'mongoose';
import { TutorAvailability } from "../models/tutorAvailability.js";
import { tutorProfile } from "../models/tutorProfile.js";
import { TutorStyle } from "../models/tutorStyle.js";
import { User } from "../models/user.js";



// Get all tutors
export const getAllTutors = async (req, res) => {
  try {
    // Find users with role "tutor"
    const tutors = await User.find({ role: "tutor" })
      .select("-password -verificationToken -verificationTokenExpires")
      .lean(); 

    // Fetch corresponding tutor subject details
    const tutorDetails = await TutorStyle.find({ user: { $in: tutors.map(t => t._id) } })
      .select("user subjects teachingStyle")
      .populate("user", "firstName lastName email photo");

    // Create a map of tutor subjects by user ID
    const subjectMap = tutorDetails.reduce((acc, curr) => {
      acc[curr.user._id.toString()] = {
        subjects: curr.subjects,
        teachingStyle: curr.teachingStyle,
      };
      return acc;
    }, {});

    // Merge user data with subject data
    const enrichedTutors = tutors.map((tutor) => {
      const details = subjectMap[tutor._id.toString()] || {};
      return {
        ...tutor,
        ...details,
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedTutors.length,
      data: enrichedTutors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Failed to fetch tutors.",
      error: error.message,
    });
  }
};



export const getFullTutorInfo = async (req, res) => {
  const { tutorId } = req.params;

  try {
    // Get tutor 
    const tutor = await User.findById(tutorId).lean();
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    const tutorObjectId = new mongoose.Types.ObjectId(tutorId);

    // query the related documents 
    const [profile, availability, style] = await Promise.all([
      tutorProfile.findOne({ user: tutorObjectId }).lean(),
      TutorAvailability.findOne({ user: tutorObjectId }).lean(),
      TutorStyle.findOne({ user: tutorObjectId }).lean(),
    ]);

    const fullTutorInfo = {
      ...tutor,
      profile,
      availability,
      style,
    };

    res.status(200).json(fullTutorInfo);
  } catch (error) {
    console.error('Error fetching full tutor info:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


export const searchTutors = async (req, res) => {
  try {
    const { subject, level, availability, rating } = req.query;

    // Build the base query for tutors
    const baseQuery = { 
      role: "tutor", 
      isVerified: true 
    };

    // Get all verified tutors
    const tutors = await User.find(baseQuery).lean();

    const filteredTutors = [];

    for (const tutor of tutors) {
      const [profile, availabilityDoc, style] = await Promise.all([
        tutorProfile.findOne({ user: tutor._id }).lean(),
        TutorAvailability.findOne({ user: tutor._id }).lean(),
        TutorStyle.findOne({ user: tutor._id }).lean()
      ]);

      // Skip if essential documents are missing
      if (!profile || !availabilityDoc || !style) continue;

      // Filter by subject and level
      if (subject || level) {
        const hasMatchingSubject = style.subjects.some(sub => {
          const subjectMatch = subject ? sub.name === subject : true;
          const levelMatch = level ? sub.level === level : true;
          return subjectMatch && levelMatch;
        });

        if (!hasMatchingSubject) continue;
      }

      // Filter by availability
      if (availability) {
        const general = availabilityDoc.generalAvailability;
        const timeMap = {
          morning: { start: "6:00 AM", end: "12:00 PM" },
          afternoon: { start: "12:00 PM", end: "6:00 PM" },
          evening: { start: "6:00 PM", end: "12:00 AM" }
        };

        const range = timeMap[availability.toLowerCase()];
        if (!range) continue;

        const startTime = general.weekdays?.start || '';
        if (!startTime || !isTimeInRange(startTime, range.start, range.end)) continue;
      }

      // Calculate matching score for sorting (optional)
      const matchingScore = calculateMatchingScore(profile, style, { subject, level });

      filteredTutors.push({
        ...tutor,
        profile,
        availability: availabilityDoc,
        style,
        matchingScore
      });
    }

    // Sort by matching score (highest first)
    filteredTutors.sort((a, b) => b.matchingScore - a.matchingScore);

    res.status(200).json({ 
      success: true,
      count: filteredTutors.length, 
      tutors: filteredTutors 
    });

  } catch (err) {
    console.error("Error in searchTutors:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Server error while searching tutors",
      error: err.message 
    });
  }
};

// Helper function to calculate matching score
function calculateMatchingScore(profile, style, filters) {
  let score = 0;
  
  // Higher score for exact subject matches
  if (filters.subject) {
    const subjectMatch = style.subjects.some(s => s.name === filters.subject);
    if (subjectMatch) score += 2;
  }
  
  // Higher score for exact level matches
  if (filters.level) {
    const levelMatch = style.subjects.some(s => s.level === filters.level);
    if (levelMatch) score += 1;
  }
  
  // Additional points for ratings
  if (profile.ratingsAverage) {
    score += profile.ratingsAverage;
  }
  
  return score;
}

// check if time is within range
function isTimeInRange(time, start, end) {
  const toMinutes = t => {
    if (!t) return 0;
    
    // Handle both "HH:MM AM/PM" and "HH:MM" formats
    const [timePart, period] = t.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    
    let totalMinutes = hours * 60 + minutes;
    
    if (period) {
      if (period.toLowerCase() === 'pm' && hours !== 12) {
        totalMinutes += 12 * 60;
      }
      if (period.toLowerCase() === 'am' && hours === 12) {
        totalMinutes -= 12 * 60;
      }
    }
    
    return totalMinutes;
  };

  const timeMinutes = toMinutes(time);
  const startMinutes = toMinutes(start);
  const endMinutes = toMinutes(end);

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}