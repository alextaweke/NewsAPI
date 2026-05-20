import DailyAnalytics from "../models/DailyAnalytics";
import Article from "../models/Article";
import { sequelize } from "../config/database";

export const getArticleViews = async (articleId: string): Promise<number> => {
  const result = await DailyAnalytics.sum("view_count", {
    where: { article_id: articleId },
  });
  return result || 0;
};

export const getAuthorDashboard = async (
  authorId: string,
  page: number = 1,
  size: number = 10,
) => {
  const offset = (page - 1) * size;

  const { count, rows } = await Article.findAndCountAll({
    where: {
      author_id: authorId,
      deleted_at: null,
    },
    attributes: ["id", "title", "created_at"],
    limit: size,
    offset,
    order: [["created_at", "DESC"]],
  });

  // Get view counts for each article
  const articlesWithViews = await Promise.all(
    rows.map(async (article) => {
      const totalViews = await getArticleViews(article.id);
      return {
        id: article.id,
        title: article.title,
        createdAt: article.created_at,
        totalViews,
      };
    }),
  );

  return {
    total: count,
    page,
    size,
    totalPages: Math.ceil(count / size),
    articles: articlesWithViews,
  };
};
