import rateLimit from "express-rate-limit";
import { redisClient } from "../config/redis";
import { Request } from "express";

// Advanced rate limiter for read tracking to prevent spam
export const readTrackingLimiter = rateLimit({
  windowMs: 10000, // 10 seconds
  max: 5, // 5 requests per 10 seconds
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.userId || req.ip;
    return `rate_limit:${req.params.id}:${userId}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests",
    object: null,
    errors: [
      "Please slow down. You can only read an article 5 times per 10 seconds.",
    ],
  },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: "Too many requests",
    object: null,
    errors: ["Please try again later."],
  },
});
