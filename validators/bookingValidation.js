import Joi from "joi";


export const createBookingValidator = Joi.object({

  subject: Joi.string().trim().required(),
  date: Joi.date().required(),
  timeSlot: Joi.object({
    start: Joi.string().required(), 
    end: Joi.string().required(),
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
});

