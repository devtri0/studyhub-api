import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.base": "Name should be a string",
      "string.empty": "Name cannot be empty",
      "string.min": "Name should have at least {#limit} characters",
      "string.max": "Name should not exceed {#limit} characters",
      "string.pattern.base": "Name can only contain letters and spaces",
      "any.required": "Name is required",
    }),

  email: Joi.string().email().required().messages({
    "string.base": "Email should be a string",
    "string.empty": "Email cannot be empty",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  phone: Joi.string()
    .pattern(/^\+?233\d{9}$|^0\d{9}$/)
    .required()
    .messages({
      "string.base": "Phone number should be a string",
      "string.empty": "Phone number cannot be empty",
      "string.pattern.base":
        "Please provide a valid Ghanaian phone number (start with 0 or +233)",
      "any.required": "Phone number is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .required()
    .messages({
      "string.base": "Password should be a string",
      "string.empty": "Password cannot be empty",
      "string.min": "Password should have at least {#limit} characters",
      "string.pattern.base":
        "Password must contain at least one uppercase, one lowercase, one number and one special character",
      "any.required": "Password is required",
    }),

  role: Joi.string().valid("student", "tutor").required().messages({
    "string.base": "Role should be a string",
    "any.only": "Role must be either student or tutor",
    "any.required": "Role is required",
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
