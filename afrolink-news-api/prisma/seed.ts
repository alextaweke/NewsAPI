import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Alex@1234", 10);

  await prisma.user.create({
    data: {
      name: "Alex Taweke",
      email: "admin@afrolink.com",
      password: hashedPassword,
      role: "super_admin",
    },
  });

  console.log("Super admin created");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
