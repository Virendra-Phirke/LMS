import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.execute(sql`SELECT typname, enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid ORDER BY typname, enumsortorder`);
  console.log(result.rows);
  process.exit(0);
}
main();
