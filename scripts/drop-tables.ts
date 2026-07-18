import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`DROP TABLE IF EXISTS borrow_records CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS reservations CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS book_copies CASCADE;`);
    console.log("Tables dropped.");
  } catch (error: any) {
    console.error("Drop failed:", error.message);
  }
  process.exit(0);
}
main();
