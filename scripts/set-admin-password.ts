import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import argon2 from "@node-rs/argon2";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle({ client });

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.log("Usage: npx tsx scripts/set-admin-password.ts <email> <password>");
    process.exit(1);
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!existingUser) {
    console.error("❌ User not found with that email.");
    process.exit(1);
  }

  if (existingUser.role !== "ADMIN") {
    console.error("❌ User is not an ADMIN.");
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, existingUser.id));

  console.log(`✅ Password set successfully for admin ${email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  });
