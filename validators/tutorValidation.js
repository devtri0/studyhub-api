import Joi from "joi";

const subjectList = [
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

const regionList = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Ahafo",
  "Bono East",
  "Oti",
  "Western North",
  "Savannah",
  "North East",
];

export const tutorProfileSchema = Joi.object({
  subjects: Joi.array()
    .items(Joi.string().valid(...subjectList))
    .min(1)
    .required()
    .messages({
      "array.base": "Subjects should be an array",
      "array.min": "Please select at least one subject",
      "any.only": "Invalid subject selected",
      "any.required": "Subjects are required",
    }),

  levels: Joi.array()
    .items(Joi.string().valid("JHS", "SHS", "Tertiary"))
    .min(1)
    .required()
    .messages({
      "array.base": "Education levels should be an array",
      "array.min": "Please select at least one education level",
      "any.only": "Invalid education level selected",
      "any.required": "Education levels are required",
    }),

  qualifications: Joi.array()
    .items(Joi.string().min(5).max(100))
    .min(1)
    .required()
    .messages({
      "array.base": "Qualifications should be an array",
      "array.min": "Please add at least one qualification",
      "string.min": "Qualification should be at least {#limit} characters",
      "string.max": "Qualification should not exceed {#limit} characters",
      "any.required": "Qualifications are required",
    }),

  experience: Joi.number().integer().min(0).max(50).required().messages({
    "number.base": "Experience should be a number",
    "number.integer": "Experience should be a whole number",
    "number.min": "Experience cannot be negative",
    "number.max": "Experience seems unrealistically high",
    "any.required": "Experience is required",
  }),

  hourlyRate: Joi.number().min(10).max(500).required().messages({
    "number.base": "Hourly rate should be a number",
    "number.min": "Hourly rate cannot be less than GHS 10",
    "number.max": "Hourly rate cannot exceed GHS 500",
    "any.required": "Hourly rate is required",
  }),

  availability: Joi.array()
    .items(
      Joi.object({
        day: Joi.string()
          .valid(
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          )
          .required(),
        times: Joi.array()
          .items(Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/))
          .min(1),
      })
    )
    .min(1)
    .messages({
      "array.base": "Availability should be an array",
      "array.min": "Please add at least one available day",
      "string.pattern.base": "Time should be in HH:MM format",
      "any.required": "Day is required",
    }),

  location: Joi.object({
    coordinates: Joi.array()
      .items(
        Joi.string().min(-180).max(180).required(),
        Joi.string().min(-90).max(90).required()
      )
      .length(2)
      .required(),
    city: Joi.string().required(),
    region: Joi.string()
      .valid(...regionList)
      .required(),
  }).required(),

  bio: Joi.string().min(20).max(500).messages({
    "string.min": "Bio should be at least {#limit} characters",
    "string.max": "Bio cannot exceed {#limit} characters",
  }),
});
