import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql, eq } from "drizzle-orm";
import { users, books, borrowRecords, reservations } from "../src/db/schema";

async function main() {
  try {
    const [
      [userCount],
      [bookCount],
      [activeBorrows],
      [pendingReservations]
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(books),
      db.select({ count: sql<number>`count(*)` }).from(borrowRecords).where(eq(borrowRecords.status, "ACTIVE")),
      db.select({ count: sql<number>`count(*)` }).from(reservations).where(eq(reservations.status, "PENDING")),
    ]);

    console.log("Stats:", {
      totalUsers: Number(userCount?.count || 0),
      totalBooks: Number(bookCount?.count || 0),
      activeBorrows: Number(activeBorrows?.count || 0),
      pendingReservations: Number(pendingReservations?.count || 0),
    });
  } catch (error: any) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}
main();
