import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        object: null,
        errors: ["No token provided"],
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;

    req.user = {
      userId: decoded.sub,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      object: null,
      errors: ["Authentication failed"],
    });
  }
};
