import Joi from "joi";

export const registerUserValidator = Joi.object({
  firstName: Joi.string()
    .min(3)
    .max(50)
    .required(),

  lastName: Joi.string()
    .min(3)
    .max(50)
    .required(),

  email: Joi.string().email().required(),

  phone: Joi.string()
    .required(),

  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .required(),

  role: Joi.string().valid("student", "tutor").required(),
});

export const loginUserValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserValidator = Joi.object({
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  photo: Joi.string().required(),
  phone: Joi.string().trim().optional(),
});
