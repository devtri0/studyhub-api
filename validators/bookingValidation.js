import Joi from "joi";


export const createBookingValidator = Joi.object({

  subject: Joi.string().trim().required(),
  date: Joi.date().required(),
  timeSlot: Joi.object({
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(), 
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  }).required(),
  status: Joi.string().valid("pending", "confirmed", "rejected", "completed"),
  meetingDetails: Joi.object({
    platform: Joi.string().valid("Zoom", "Google Meet", "Skype", "Other").optional(),
    link: Joi.string().uri().optional(),
    instructions: Joi.string().optional(),
  }).optional(),
});

export const updateBookingValidator = Joi.object({
  status: Joi.string().valid("confirmed", "rejected", "cancelled", "completed").required(),
  meetingLink: Joi.string().uri().when("status", {
    is: "confirmed",
    then: Joi.required(),
    otherwise: Joi.optional()
  })
  .messages({
    "string.uri": "Meeting link must be a valid URL"
  })
});

