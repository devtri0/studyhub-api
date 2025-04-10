import Joi from "joi";

const subjects = [
  "Mathematics",
  "English",
  "Science",
  "Social Studies",
  "ICT",
  "Integrated Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Accounting",
  "Business",
  "Geography",
  "History",
  "Government",
  "French",
  "Ga",
  "Twi",
  "Ewe",
  "Fante",
  "Other",
];

export const studyGroupSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[A-Za-z0-9\s]+$/)
    .required()
    .messages({
      "string.min": "Group name must be at least 3 characters",
      "string.max": "Group name cannot exceed 50 characters",
      "string.pattern.base":
        "Group name can only contain letters, numbers and spaces",
      "any.required": "Group name is required",
    }),

  description: Joi.string().max(300).messages({
    "string.max": "Description cannot exceed 300 characters",
  }),

  subject: Joi.string()
    .valid(...subjects)
    .required()
    .messages({
      "any.only": `Subject must be one of: ${subjects.join(", ")}`,
      "any.required": "Subject is required",
    }),

  educationLevel: Joi.string()
    .valid("JHS", "SHS", "Tertiary")
    .required()
    .messages({
      "any.only": "Education level must be JHS, SHS, or Tertiary",
      "any.required": "Education level is required",
    }),

  isPublic: Joi.boolean().default(true),

  region: Joi.string()
    .valid(...regions)
    .messages({
      "any.only": `Region must be one of: ${regions.join(", ")}`,
    }),

  meetings: Joi.array()
    .items(
      Joi.object({
        date: Joi.date().greater("now").required().messages({
          "date.greater": "Meeting date must be in the future",
          "any.required": "Meeting date is required",
        }),
        time: Joi.string()
          .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .required()
          .messages({
            "string.pattern.base": "Invalid time format (use HH:MM)",
            "any.required": "Meeting time is required",
          }),
        location: Joi.string().min(3).required().messages({
          "string.min": "Location must be at least 3 characters",
          "any.required": "Meeting location is required",
        }),
        agenda: Joi.string().max(200).messages({
          "string.max": "Agenda cannot exceed 200 characters",
        }),
      })
    )
    .messages({
      "array.base": "Meetings must be an array",
    }),
});
