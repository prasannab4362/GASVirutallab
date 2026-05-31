import "dotenv/config";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error("Error: DATABASE_URL is not set in your .env file.");
    process.exit(1);
  }

  if (!url.startsWith("libsql://") && !url.startsWith("https://") && !url.startsWith("http://")) {
    console.error("Error: DATABASE_URL must be a remote Turso URL (starting with libsql://, https://, or http://) to sync schema.");
    process.exit(1);
  }

  console.log("Connecting to Turso database...");
  console.log("URL:", url);

  const client = createClient({ url, authToken });

  const sqlPath = path.resolve(__dirname, "schema.sql");
  if (!fs.existsSync(sqlPath)) {
    console.error(`Error: Schema file not found at ${sqlPath}. Make sure prisma/schema.sql exists.`);
    process.exit(1);
  }

  console.log("Reading schema.sql...");
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");

  // Parse SQL into individual statements
  const statements: string[] = [];
  let currentStmt = "";

  const lines = sqlContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("--")) {
      continue; // Skip comments and empty lines
    }
    currentStmt += line + "\n";
    if (trimmed.endsWith(";")) {
      statements.push(currentStmt.trim());
      currentStmt = "";
    }
  }

  console.log(`Parsed ${statements.length} SQL statements to execute.`);

  console.log("Syncing database schema on Turso...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
    } catch (err: any) {
      // If table/index already exists, log it but don't fail the whole script
      if (err.message && (err.message.includes("already exists") || err.message.includes("duplicate"))) {
        console.warn(`[Warning] Statement ${i + 1} skipped: Table/index already exists.`);
      } else {
        console.error(`[Error] Statement ${i + 1} failed:`, stmt);
        console.error(err);
        process.exit(1);
      }
    }
  }

  console.log("🚀 Turso Database Schema synchronized successfully!");
  client.close();
}

main().catch((err) => {
  console.error("Sync script execution failed:", err);
  process.exit(1);
});
