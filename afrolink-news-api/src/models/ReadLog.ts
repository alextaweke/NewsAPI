import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Article from "./Article";
import User from "./User";

interface ReadLogAttributes {
  id: string;
  article_id: string | string[];
  reader_id: string | null;
  read_at: Date;
}

interface ReadLogCreationAttributes extends Optional<
  ReadLogAttributes,
  "id" | "read_at"
> {}

class ReadLog
  extends Model<ReadLogAttributes, ReadLogCreationAttributes>
  implements ReadLogAttributes
{
  public id!: string;
  public article_id!: string | string[];
  public reader_id!: string | null;
  public read_at!: Date;
}

ReadLog.init(
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
    reader_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    read_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "read_logs",
    timestamps: false,
  },
);

Article.hasMany(ReadLog, { foreignKey: "article_id" });
ReadLog.belongsTo(Article, { foreignKey: "article_id" });
User.hasMany(ReadLog, { foreignKey: "reader_id" });
ReadLog.belongsTo(User, { foreignKey: "reader_id" });

export default ReadLog;
