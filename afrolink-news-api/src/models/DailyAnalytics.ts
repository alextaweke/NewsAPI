import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Article from "./Article";

interface DailyAnalyticsAttributes {
  id: string;
  article_id: string;
  view_count: number;
  date: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface DailyAnalyticsCreationAttributes extends Optional<
  DailyAnalyticsAttributes,
  "id" | "view_count"
> {}

class DailyAnalytics
  extends Model<DailyAnalyticsAttributes, DailyAnalyticsCreationAttributes>
  implements DailyAnalyticsAttributes
{
  public id!: string;
  public article_id!: string;
  public view_count!: number;
  public date!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

DailyAnalytics.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    article_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Article,
        key: "id",
      },
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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
    tableName: "daily_analytics",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["article_id", "date"],
      },
    ],
  },
);

Article.hasMany(DailyAnalytics, { foreignKey: "article_id" });
DailyAnalytics.belongsTo(Article, { foreignKey: "article_id" });

export default DailyAnalytics;
