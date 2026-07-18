import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";
import { books, bookCopies } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const allBooks = await db.select().from(books);
    let createdCount = 0;
    
    for (const book of allBooks) {
      const copies = await db.select().from(bookCopies).where(eq(bookCopies.bookId, book.id));
      if (copies.length === 0) {
        const copiesToCreate = Math.max(1, book.totalCopies || 1);
        const newCopies = Array.from({ length: copiesToCreate }).map((_, i) => ({
          bookId: book.id,
          barcode: `${book.isbn || 'BK'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${i + 1}`,
          status: "AVAILABLE" as const,
        }));
        await db.insert(bookCopies).values(newCopies);
        createdCount += newCopies.length;
      }
    }
    console.log(`Generated ${createdCount} missing book copies.`);
  } catch (error: any) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}
main();
