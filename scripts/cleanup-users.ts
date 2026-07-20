import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, userProfiles, students, librarians, sessions, emailOtps } from "../src/db/schema";
import { ne, eq, sql } from "drizzle-orm";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

async function cleanupUsers() {
  console.log("🧹 Starting user cleanup...\n");

  // Count total users before cleanup
  const [{ count: totalBefore }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  console.log(`   Total users before cleanup: ${totalBefore}`);

  // Find virendra
  const [virendra] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, "virendra"))
    .limit(1);

  if (!virendra) {
    console.log("\n⚠️  Virendra admin account not found!");
    console.log("   Run 'npx tsx scripts/seed-admin.ts' first to create it.\n");
    return;
  }

  console.log(`   Found virendra: id=${virendra.id}, role=${virendra.role}\n`);

  // Delete all users except virendra (cascade handles profiles, students, etc.)
  const deleted = await db
    .delete(users)
    .where(ne(users.id, virendra.id))
    .returning({ id: users.id, email: users.email });

  console.log(`🗑️  Deleted ${deleted.length} user(s):`);
  for (const u of deleted) {
    console.log(`   - ${u.email} (${u.id})`);
  }

  // Verify final state
  const [{ count: totalAfter }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  console.log(`\n✅ Cleanup complete! Users remaining: ${totalAfter}`);
  console.log("   Only virendra admin account remains.\n");
}

cleanupUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  });
