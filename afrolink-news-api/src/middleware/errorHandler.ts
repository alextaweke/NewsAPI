import { Request, Response, NextFunction } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", error);

  // Handle Sequelize unique constraint error (duplicate email)
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      message: "Conflict",
      object: null,
      errors: ["Email already exists"],
    });
  }

  // Handle validation errors
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      object: null,
      errors: error.errors.map((e) => e.message),
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
    object: null,
    errors: [
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
    ],
  });
};
