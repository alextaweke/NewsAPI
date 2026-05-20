import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.pattern.base": "Name must contain only alphabets and spaces",
    }),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters with one uppercase, one lowercase, one number, and one special character",
    }),
  role: Joi.string().valid("author", "reader").required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createArticleSchema = Joi.object({
  title: Joi.string().min(1).max(150).required(),
  content: Joi.string().min(50).required(),
  category: Joi.string().required(),
  status: Joi.string().valid("Draft", "Published").default("Draft"),
});

export const updateArticleSchema = Joi.object({
  title: Joi.string().min(1).max(150),
  content: Joi.string().min(50),
  category: Joi.string(),
  status: Joi.string().valid("Draft", "Published"),
}).min(1);

export const articleQuerySchema = Joi.object({
  category: Joi.string(),
  author: Joi.string(),
  q: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().integer().min(1).max(100).default(10),
});
