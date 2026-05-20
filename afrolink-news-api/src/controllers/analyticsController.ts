import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getAuthorDashboard } from "../services/analyticsService";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;

    const dashboard = await getAuthorDashboard(req.user!.userId, page, size);

    return res.status(200).json({
      success: true,
      message: "Dashboard retrieved successfully",
      object: dashboard.articles,
      pageNumber: page,
      pageSize: size,
      totalSize: dashboard.total,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to retrieve dashboard"],
    });
  }
};
