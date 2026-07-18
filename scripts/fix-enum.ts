import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Fixing enum in DB...");

  try {
    // Add ACTIVE if it doesn't exist, or rename BORROWED to ACTIVE
    // We can't rename in a transaction if it's already used, but ALTER TYPE ... RENAME VALUE is supported in pg 10+
    await db.execute(sql`
      ALTER TYPE "borrow_status" RENAME VALUE 'BORROWED' TO 'ACTIVE';
    `);
    console.log("Enum renamed successfully");
  } catch (error: any) {
    console.error("Rename failed, maybe it doesn't exist or is already ACTIVE. Error:", error.message);
    try {
      await db.execute(sql`
        ALTER TYPE "borrow_status" ADD VALUE IF NOT EXISTS 'ACTIVE';
      `);
      console.log("Added ACTIVE to enum successfully");
    } catch (e: any) {
      console.error("Add value failed. Error:", e.message);
    }
  }

  process.exit(0);
}

main();
