import Joi from "joi";

export const tutorProfileValidator = Joi.object({

  specialization: Joi.array()
    .items(Joi.string().min(3).max(100))
    .min(1)
    .required(),

  languages: Joi.array().items(Joi.string().min(2).max(30)).min(1).required(),

  education: Joi.array().items(Joi.string().min(5).max(200)).min(1).required(),

  experience: Joi.array()
    .items(Joi.string().min(10).max(500))
    .min(1)
    .required(),

  location: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    gpsAddress: Joi.array()
      .items(
        Joi.string().required(),
        Joi.string().required()
      ).required(),

    address: Joi.string().max(200),
    city: Joi.string().max(100),
    region: Joi.string().max(100),
  }).required(),

  bio: Joi.string().max(500),
  ratingsAverage: Joi.number().min(1).max(5).default(4.5),
  ratingsQuantity: Joi.number().integer().min(0).default(0),
  isVerified: Joi.boolean().default(false),
});

export const tutorProfileUpdateValidator = tutorProfileValidator


// regex for time format validation
const timeFormatRegex = /^([1-9]|1[0-2])(:\d{2})? (AM|PM)$/i;

export const tutorAvailabilityValidator = Joi.object({
  generalAvailability: Joi.object({
    weekdays: Joi.object({
      start: Joi.string().pattern(timeFormatRegex).required(),
      end: Joi.string().pattern(timeFormatRegex).required()
    }).required(),
    weekends: Joi.object({
      start: Joi.string().pattern(timeFormatRegex).required(),
      end: Joi.string().pattern(timeFormatRegex).required()
    }).required(),
    notes: Joi.string().max(500)
  }).required(),
  
  specificSlots: Joi.array().items(
    Joi.object({
      day: Joi.string().valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun").required(),
      date: Joi.number().integer().min(1).max(31),
      slots: Joi.array().items(
        Joi.object({
          start: Joi.string().pattern(timeFormatRegex).required(),
          end: Joi.string().pattern(timeFormatRegex).required()
        })
      ).min(1).required()
    })
  )
});

export const tutorAvailabilityUpdateValidator = tutorAvailabilityValidator;


export const tutorStyleValidator = Joi.object({
  teachingStyle: Joi.string()
    .valid(
      "Student-Centered Learning",
      "Interactive Methods",
      "Engaging Methods",
      "Personalized Approaches",
      "Knowledge Empowerment"
    )
    .required(),

  subjects: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .valid(
            "Mathematics", "English", "Science", "Social Studies", "ICT",
            "Integrated Science", "Physics", "Chemistry", "Biology", "Economics",
            "Accounting", "Business", "Geography", "History", "Government",
            "French", "Ga", "Twi", "Ewe", "Fante", "Other"
          )
          .required(),
        level: Joi.string()
          .valid("Beginner", "Intermediate", "Advanced")
          .default("Intermediate")
      })
    )
    .min(1)
    .required()
});

export const tutorStyleUpdateValidator = tutorStyleValidator;
