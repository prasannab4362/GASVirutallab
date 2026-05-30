import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const prismaClientSingleton = () => {
  const envUrl = process.env.DATABASE_URL;
  const url = envUrl && envUrl !== "undefined" ? envUrl : "file:./dev.db";
  
  console.log("Prisma connecting with URL:", url);
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

