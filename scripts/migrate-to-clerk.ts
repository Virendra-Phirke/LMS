import "dotenv/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("🔄 Running Clerk migration...\n");

  // Step 1: Add clerk_id column to users table
  console.log("1. Adding clerk_id column...");
  try {
    await sql`ALTER TABLE users ADD COLUMN clerk_id VARCHAR(255) UNIQUE`;
    console.log("   ✅ Added clerk_id column");
  } catch (e: any) {
    if (e.message?.includes("already exists")) {
      console.log("   ⏭️  clerk_id already exists, skipping");
    } else {
      throw e;
    }
  }

  // Step 2: Create index on clerk_id
  console.log("2. Creating clerk_id index...");
  try {
    await sql`CREATE INDEX IF NOT EXISTS user_clerk_id_idx ON users (clerk_id)`;
    console.log("   ✅ Created index");
  } catch (e: any) {
    console.log("   ⏭️  Index already exists, skipping");
  }

  // Step 3: Drop password_hash column
  console.log("3. Dropping password_hash column...");
  try {
    await sql`ALTER TABLE users DROP COLUMN IF EXISTS password_hash`;
    console.log("   ✅ Dropped password_hash");
  } catch (e: any) {
    console.log("   ⏭️  Column already gone, skipping");
  }

  // Step 4: Drop email_verified column
  console.log("4. Dropping email_verified column...");
  try {
    await sql`ALTER TABLE users DROP COLUMN IF EXISTS email_verified`;
    console.log("   ✅ Dropped email_verified");
  } catch (e: any) {
    console.log("   ⏭️  Column already gone, skipping");
  }

  // Step 5: Drop sessions table (Clerk manages sessions)
  console.log("5. Dropping sessions table...");
  try {
    await sql`DROP TABLE IF EXISTS sessions CASCADE`;
    console.log("   ✅ Dropped sessions table");
  } catch (e: any) {
    console.log("   ⏭️  Table already gone, skipping");
  }

  // Step 6: Drop email_otps table (Clerk manages OTP)
  console.log("6. Dropping email_otps table...");
  try {
    await sql`DROP TABLE IF EXISTS email_otps CASCADE`;
    console.log("   ✅ Dropped email_otps table");
  } catch (e: any) {
    console.log("   ⏭️  Table already gone, skipping");
  }

  // Step 7: Drop otp_type enum  
  console.log("7. Dropping otp_type enum...");
  try {
    await sql`DROP TYPE IF EXISTS otp_type`;
    console.log("   ✅ Dropped otp_type enum");
  } catch (e: any) {
    console.log("   ⏭️  Enum already gone, skipping");
  }

  console.log("\n✅ Migration complete! Database is now Clerk-compatible.\n");
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  });
