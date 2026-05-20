import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        object: null,
        errors: ["User not authenticated"],
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        object: null,
        errors: ["Insufficient permissions"],
      });
    }

    next();
  };
};
