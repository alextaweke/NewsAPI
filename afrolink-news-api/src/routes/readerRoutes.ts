import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getPublicArticles,
  getArticleById,
} from "../controllers/readerController";
import { readTrackingLimiter, apiLimiter } from "../middleware/rateLimiter";

const router = Router();

router.get("/articles", apiLimiter, getPublicArticles);
router.get("/articles/:id", apiLimiter, readTrackingLimiter, getArticleById);

export default router;
