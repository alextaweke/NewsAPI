import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Article from "../models/Article";
import User from "../models/User";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../validators/schemas";
import { Op } from "sequelize";

export const createArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = createArticleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        object: null,
        errors: error.details.map((d) => d.message),
      });
    }

    const { title, content, category, status } = req.body;

    const article = await Article.create({
      title,
      content,
      category,
      status: status || "Draft",
      author_id: req.user!.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Article created successfully",
      object: article,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to create article"],
    });
  }
};

export const getMyArticles = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const includeDeleted = req.query.include_deleted === "true";
    const offset = (page - 1) * size;

    const whereClause: any = {
      author_id: req.user!.userId,
    };

    if (!includeDeleted) {
      whereClause.deleted_at = null;
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

    // Add deleted flag for soft-deleted articles
    const articlesWithStatus = rows.map((article) => ({
      ...article.toJSON(),
      isDeleted: article.deleted_at !== null,
    }));

    return res.status(200).json({
      success: true,
      message: "Articles retrieved successfully",
      object: articlesWithStatus,
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

export const updateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { error } = updateArticleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        object: null,
        errors: error.details.map((d) => d.message),
      });
    }

    const { id } = req.params;

    const article = await Article.findOne({
      where: { id, author_id: req.user!.userId },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
        object: null,
        errors: ["Article does not exist or you do not have permission"],
      });
    }

    if (article.deleted_at !== null) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        object: null,
        errors: ["Cannot update a deleted article"],
      });
    }

    await article.update(req.body);

    return res.status(200).json({
      success: true,
      message: "Article updated successfully",
      object: article,
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to update article"],
    });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const article = await Article.findOne({
      where: { id, author_id: req.user!.userId },
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
        object: null,
        errors: ["Article does not exist or you do not have permission"],
      });
    }

    // Soft delete
    await article.update({ deleted_at: new Date() });

    return res.status(200).json({
      success: true,
      message: "Article deleted successfully",
      object: { id, deleted_at: article.deleted_at },
      errors: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      object: null,
      errors: ["Failed to delete article"],
    });
  }
};
