import { Router } from "express";
import { signup, login } from "../controllers/authController";
import { apiLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/signup", apiLimiter, signup);
router.post("/login", apiLimiter, login);

export default router;
