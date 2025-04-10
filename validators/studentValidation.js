import Joi from "joi";

const educationLevels = ["JHS", "SHS", "Tertiary"];
const regions = [
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

export const studentProfileSchema = Joi.object({
  educationLevel: Joi.string()
    .valid(...educationLevels)
    .required()
    .messages({
      "any.only": `Education level must be one of: ${educationLevels.join(
        ", "
      )}`,
      "any.required": "Education level is required",
    }),

  school: Joi.string().min(3).max(100).required().messages({
    "string.min": "School name must be at least 3 characters",
    "string.max": "School name cannot exceed 100 characters",
    "any.required": "School name is required",
  }),

  subjectsOfInterest: Joi.array()
    .items(Joi.string().min(2).max(30))
    .max(10)
    .messages({
      "array.max": "Cannot select more than 10 subjects",
      "string.min": "Subject name too short",
      "string.max": "Subject name too long",
    }),

  location: Joi.object({
    city: Joi.string().min(2).max(50).required().messages({
      "string.min": "City name must be at least 2 characters",
      "string.max": "City name cannot exceed 50 characters",
      "any.required": "City is required",
    }),
    region: Joi.string()
      .valid(...regions)
      .required()
      .messages({
        "any.only": `Region must be one of: ${regions.join(", ")}`,
        "any.required": "Region is required",
      }),
  }).required(),

  learningGoals: Joi.string().max(300).messages({
    "string.max": "Learning goals cannot exceed 300 characters",
  }),
});
