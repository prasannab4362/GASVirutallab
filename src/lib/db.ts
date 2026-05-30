import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const prismaClientSingleton = () => {
  const envUrl = process.env.DATABASE_URL;
  let url = envUrl && envUrl !== "undefined" ? envUrl : "";
  if (!url) {
    const dbPath = path.join(process.cwd(), "dev.db");
    url = `file:${dbPath}`;
  }
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  
  console.log("Prisma connecting with URL:", url);
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

