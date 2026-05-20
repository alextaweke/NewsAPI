import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "author" | "reader";
  created_at?: Date;
  updated_at?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: "author" | "reader";
  declare readonly created_at: Date;
  declare readonly updated_at: Date;
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isAlphaSpaces(value: string) {
          if (!/^[A-Za-z\s]+$/.test(value)) {
            throw new Error("Name must contain only alphabets and spaces");
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("author", "reader"),
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
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: async (user: User) => {
        if (!user.password) {
          throw new Error("Password is undefined");
        }

        const saltRounds = Number(process.env.BCRYPT_ROUNDS) || 10;

        user.password = await bcrypt.hash(String(user.password), saltRounds);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || "10");
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  },
);

export default User;
