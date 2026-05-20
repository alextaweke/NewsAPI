import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import {
  createArticle,
  getMyArticles,
  updateArticle,
  deleteArticle,
} from "../controllers/articleController";
import { validate } from "../middleware/validation";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../validators/schemas";

const router = Router();

// All routes require authentication and author role
router.use(authenticate);
router.use(requireRole(["author"]));

router.post("/", validate(createArticleSchema), createArticle);
router.get("/me", getMyArticles);
router.put("/:id", validate(updateArticleSchema), updateArticle);
router.delete("/:id", deleteArticle);

export default router;
