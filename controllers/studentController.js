import mongoose from 'mongoose';
import { TutorAvailability } from "../models/tutorAvailability.js";
import { tutorProfile } from "../models/tutorProfile.js";
import { TutorStyle } from "../models/tutorStyle.js";
import { User } from "../models/user.js";

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
    const { subject, availability, rating } = req.query;

    // get all tutors
    const tutors = await User.find({ role: "tutor", isVerified: true }).lean();

    const filteredTutors = [];

    for (const tutor of tutors) {
      const [profile, availabilityDoc] = await Promise.all([
        tutorProfile.findOne({ user: tutor._id }).lean(),
        TutorAvailability.findOne({ user: tutor._id }).lean(),
      ]);

      if (!profile || !availabilityDoc) continue;

      // Filter by subject
      if (subject && !profile.specialization.includes(subject)) continue;

      // Filter by rating
      if (rating && profile.ratingsAverage < parseFloat(rating)) continue;

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

      filteredTutors.push({
        ...tutor,
        profile,
        availability: availabilityDoc,
      });
    }

    res.status(200).json({ count: filteredTutors.length, tutors: filteredTutors });

  } catch (err) {
    console.error("Error in searchTutors:", err.message);
    res.status(500).json({ message: "Server error while searching tutors" });
  }
};

// check if time is within range
function isTimeInRange(time, start, end) {
  const to24 = t => {
    const [hour, minPart] = t.split(":");
    const [min, mer] = minPart.split(" ");
    let h = parseInt(hour);
    if (mer.toLowerCase() === "pm" && h !== 12) h += 12;
    if (mer.toLowerCase() === "am" && h === 12) h = 0;
    return h * 60 + parseInt(min);
  };

  const t = to24(time);
  return t >= to24(start) && t <= to24(end);
}

