import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
});

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@company.com" },
    update: {},
    create: {
      name: "管理員",
      email: "admin@company.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  // Create default company info
  await prisma.companyInfo.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "您的公司名稱",
      address: "公司地址",
      phone: "02-1234-5678",
      email: "info@company.com",
      taxId: "12345678",
    },
  });

  console.log("Seed 完成！");
  console.log("預設帳號：admin@company.com");
  console.log("預設密碼：admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
