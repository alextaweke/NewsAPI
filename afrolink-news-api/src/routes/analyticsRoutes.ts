import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { getDashboard } from "../controllers/analyticsController";

const router = Router();

router.use(authenticate);
router.use(requireRole(["author"]));

router.get("/dashboard", getDashboard);

export default router;
