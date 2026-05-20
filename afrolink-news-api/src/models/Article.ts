import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import User from "./User";

interface ArticleAttributes {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "Draft" | "Published";
  author_id: string;
  deleted_at: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

interface ArticleCreationAttributes extends Optional<
  ArticleAttributes,
  "id" | "deleted_at"
> {}

class Article
  extends Model<ArticleAttributes, ArticleCreationAttributes>
  implements ArticleAttributes
{
  public id!: string;
  public title!: string;
  public content!: string;
  public category!: string;
  public status!: "Draft" | "Published";
  public author_id!: string;
  public deleted_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: [1, 150],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 10000],
      },
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Draft", "Published"),
      defaultValue: "Draft",
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "articles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    paranoid: false,
  },
);

// Associations
User.hasMany(Article, { foreignKey: "author_id", as: "articles" });
Article.belongsTo(User, { foreignKey: "author_id", as: "author" });

export default Article;
