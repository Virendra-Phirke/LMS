import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, userProfiles } from "../src/db/schema";
import { eq } from "drizzle-orm";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

/**
 * Sets up the admin account by linking a Clerk user to the DB.
 * 
 * Usage: npx tsx scripts/setup-admin.ts <clerk-user-id> <email>
 * 
 * You can find your Clerk user ID in the Clerk Dashboard → Users.
 * It looks like: user_2abc123def456
 */
async function main() {
  const clerkId = process.argv[2];
  const email = process.argv[3];

  if (!clerkId || !email) {
    console.log("Usage: npx tsx scripts/setup-admin.ts <clerk-user-id> <email>");
    console.log("Example: npx tsx scripts/setup-admin.ts user_2abc123 admin@example.com");
    console.log("\nYou can find your Clerk user ID in the Clerk Dashboard → Users.");
    process.exit(1);
  }

  console.log(`\n🔧 Setting up admin account...`);
  console.log(`   Clerk ID: ${clerkId}`);
  console.log(`   Email: ${email}\n`);

  // Check if user with this email exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existingUser) {
    // Update existing user with Clerk ID
    await db
      .update(users)
      .set({
        clerkId,
        role: "ADMIN",
        status: "ACTIVE",
      })
      .where(eq(users.id, existingUser.id));

    console.log(`✅ Updated existing user as ADMIN.`);
  } else {
    // Create new admin user
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId,
        email: email.toLowerCase(),
        role: "ADMIN",
        status: "ACTIVE",
      })
      .returning();

    // Create profile
    await db.insert(userProfiles).values({
      userId: newUser.id,
      fullName: "System Administrator",
    });

    console.log(`✅ Created new admin user.`);
  }

  console.log(`\n   ┌─────────────────────────────────────┐`);
  console.log(`   │  Admin Account Ready                 │`);
  console.log(`   ├─────────────────────────────────────┤`);
  console.log(`   │  Email:    ${email.padEnd(23)}  │`);
  console.log(`   │  Role:     ADMIN                     │`);
  console.log(`   │  Status:   ACTIVE                    │`);
  console.log(`   └─────────────────────────────────────┘\n`);
  console.log(`⚠️  Make sure to also set publicMetadata in Clerk Dashboard:`);
  console.log(`   { "role": "ADMIN" }\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  });
