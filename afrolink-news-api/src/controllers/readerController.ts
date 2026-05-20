import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Article from "../models/Article";
import ReadLog from "../models/ReadLog";
import User from "../models/User";
import { Op } from "sequelize";
import { addAnalyticsJob } from "../services/queueService";
import { articleQuerySchema } from "../validators/schemas";

export const getPublicArticles = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = articleQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        object: null,
        errors: error.details.map((d) => d.message),
      });
    }

    const { category, author, q, page, size } = value;
    const offset = (page - 1) * size;

    const whereClause: any = {
      status: "Published",
      deleted_at: null,
    };

    if (category) {
      whereClause.category = category;
    }

    if (author) {
      whereClause["$author.name$"] = { [Op.iLike]: `%${author}%` };
    }

    if (q) {
      whereClause.title = { [Op.iLike]: `%${q}%` };
    }

    const { count, rows } = await Article.findAndCountAll({
      where: whereClause,
      limit: size,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Articles retrieved successfully",
      object: rows,
      pageNumber: page,
      pageSize: size,
      totalSize: count,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to retrieve articles"],
    });
  }
};

export const getArticleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findOne({
      where: {
        id,
        status: "Published",
        deleted_at: null,
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "News article no longer available",
        object: null,
        errors: ["Article not found or has been deleted"],
      });
    }

    // Create read log asynchronously (doesn't block response)
    const readerId = req.user?.userId || null;
    setImmediate(async () => {
      try {
        await ReadLog.create({
          article_id: id,
          reader_id: readerId,
          read_at: new Date(),
        });

        // Trigger analytics processing (will be picked up by queue)
        await addAnalyticsJob();
      } catch (logError) {
        console.error("Failed to create read log:", logError);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Article retrieved successfully",
      object: article,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to retrieve article"],
    });
  }
};
