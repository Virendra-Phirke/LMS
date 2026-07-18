import "dotenv/config";
import { db } from "../src/db";
import { users, userProfiles } from "../src/db/schema";
import { hash } from "@node-rs/argon2";
import { eq } from "drizzle-orm";

async function main() {
  const email = "virendra";
  const password = "2004";

  console.log(`Checking if admin user ${email} exists...`);
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const passwordHash = await hash(password);

  if (existingUser) {
    console.log(`User exists, updating password...`);
    await db
      .update(users)
      .set({ passwordHash, role: "ADMIN", status: "ACTIVE", emailVerified: true })
      .where(eq(users.id, existingUser.id));
      
    console.log(`Admin user ${email} updated successfully!`);
  } else {
    console.log(`Creating new admin user ${email}...`);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      })
      .returning();

    await db.insert(userProfiles).values({
      userId: newUser.id,
      fullName: "Virendra Admin",
    });

    console.log(`Admin user ${email} created successfully!`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
