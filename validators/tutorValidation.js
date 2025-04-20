import Joi from "joi";

export const tutorProfileValidator = Joi.object({

  specialization: Joi.array()
    .items(Joi.string().min(3).max(100))
    .min(1)
    .required(),

  languages: Joi.array().items(Joi.string()).required(),

  education: Joi.array().items(Joi.string()).required(),

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

    address: Joi.string(),
    city: Joi.string(),
    region: Joi.string()
  }).required(),

  bio: Joi.string().max(500),
  ratingsAverage: Joi.number().default(4.5),
  ratingsQuantity: Joi.number().default(0),
  isVerified: Joi.boolean().default(false),
});

export const tutorProfileUpdateValidator = tutorProfileValidator


export const tutorAvailabilityValidator = Joi.object({
  generalAvailability: Joi.object({
    weekdays: Joi.object({
      start: Joi.string().required(),
      end: Joi.string().required()
    }).required(),
    weekends: Joi.object({
      start: Joi.string().required(),
      end: Joi.string().required()
    }).required(),
    notes: Joi.string().max(500)
  }).required(),
  
  specificSlots: Joi.array().items(
    Joi.object({
      day: Joi.string().valid("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun").required(),
      date: Joi.number(),
      slots: Joi.array().items(
        Joi.object({
          start: Joi.string().required(),
          end: Joi.string().required()
        })
      ).required()
    })
  )
});

export const tutorAvailabilityUpdateValidator = tutorAvailabilityValidator;


export const tutorStyleValidator = Joi.object({
  teachingStyle: Joi.string()
    .valid(
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
          .valid("JHS", "SHS", "Tertiary")
          .default("SHS")
      })
    )
    .min(1)
    .required()
});

export const tutorStyleUpdateValidator = tutorStyleValidator;
