import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding password_hash column...");
  try {
    await sql`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "password_hash" varchar(255);
    `;
    console.log("Column added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to add column:", error);
    process.exit(1);
  }
}

main();
