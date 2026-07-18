import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'borrow_records'`);
  console.log(result.rows);
  process.exit(0);
}
main();
