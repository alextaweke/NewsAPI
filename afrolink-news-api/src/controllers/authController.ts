import { Request, Response } from "express";
import prisma from "../prisma/client";
import { generateToken } from "../config/jwt";
import { signupSchema, loginSchema } from "../validators/schemas";
import bcrypt from "bcrypt";
export const signup = async (req: Request, res: Response) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        object: null,
        errors: error.details.map((d) => d.message),
      });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Conflict",
        object: null,
        errors: ["Email already exists"],
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
      },
    });
    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      object: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to create user"],
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        object: null,
        errors: error.details.map((d) => d.message),
      });
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        object: null,
        errors: ["Email or password is incorrect"],
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
        object: null,
        errors: ["Email or password is incorrect"],
      });
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      object: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to login"],
    });
  }
};
