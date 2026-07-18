import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const d = new Date().toISOString();
    const res = await db.execute(sql`select DATE("issued_at"), count(*) from "borrow_records" where "borrow_records"."issued_at" >= ${d} group by DATE("borrow_records"."issued_at") order by DATE("borrow_records"."issued_at")`);
    console.log(res);
  } catch (error: any) {
    console.error("Full Error:", error);
    if (error.cause) console.error("Cause:", error.cause);
  }
  process.exit(0);
}
main();
