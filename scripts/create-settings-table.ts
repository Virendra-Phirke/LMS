import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Creating settings table...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "settings" (
        "key" varchar(50) PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    console.log("Settings table created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to create settings table:", error);
    process.exit(1);
  }
}

main();
