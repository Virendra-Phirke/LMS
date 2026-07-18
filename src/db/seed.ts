import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "@node-rs/argon2";
import { users, userProfiles } from "./schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function seed() {
  console.log("🌱 Seeding database...\n");

  const adminEmail = "admin@library.com";
  const adminPassword = "Admin@1234";

  // Check if admin already exists
  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin) {
    console.log("⚠️  Admin account already exists. Skipping seed.\n");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Role: ADMIN`);
    console.log(`   Status: ${existingAdmin.status}`);
    return;
  }

  // Hash password
  console.log("🔐 Hashing password...");
  const passwordHash = await hash(adminPassword);

  // Create admin user
  console.log("👤 Creating admin user...");
  const [admin] = await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    })
    .returning();

  // Create profile
  console.log("📋 Creating admin profile...");
  await db.insert(userProfiles).values({
    userId: admin.id,
    fullName: "System Administrator",
  });

  console.log("\n✅ Admin account created successfully!\n");
  console.log("   ┌─────────────────────────────────────┐");
  console.log("   │  Admin Login Credentials             │");
  console.log("   ├─────────────────────────────────────┤");
  console.log(`   │  Email:    ${adminEmail.padEnd(23)}  │`);
  console.log(`   │  Password: ${adminPassword.padEnd(23)}  │`);
  console.log("   │  Role:     ADMIN                     │");
  console.log("   └─────────────────────────────────────┘");
  console.log("\n⚠️  Change the password after first login!\n");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
