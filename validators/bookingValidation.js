import Joi from "joi";

export const bookingSchema = Joi.object({
  tutorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid tutor ID format",
      "any.required": "Tutor ID is required",
    }),

  subject: Joi.string().required().messages({
    "any.required": "Subject is required",
  }),

  date: Joi.date().greater("now").required().messages({
    "date.base": "Invalid date format",
    "date.greater": "Booking date must be in the future",
    "any.required": "Date is required",
  }),

  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid time format (use HH:MM)",
      "any.required": "Start time is required",
    }),

  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .custom((value, helpers) => {
      const start = helpers.state.ancestors[0].startTime;
      if (value <= start) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "string.pattern.base": "Invalid time format (use HH:MM)",
      "any.required": "End time is required",
      "any.invalid": "End time must be after start time",
    }),

  meetingLink: Joi.string().uri().messages({
    "string.uri": "Please provide a valid meeting URL",
  }),
});
