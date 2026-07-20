import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });
const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const users = await sql`SELECT email, role, status FROM users`;
  console.log(users);
  process.exit(0);
}
main();
