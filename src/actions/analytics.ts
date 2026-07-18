"use server";

import { db } from "@/db";
import { books, borrowRecords, bookCategories, categories } from "@/db/schema";
import { sql, eq, gte, desc } from "drizzle-orm";
import { withCache } from "@/lib/cache";

export async function getAnalyticsData() {
  return withCache(async () => {
    // 1. Borrows over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBorrows = await db
      .select({
        date: sql<string>`DATE(${borrowRecords.issuedAt})`,
        count: sql<number>`count(*)`,
      })
      .from(borrowRecords)
      .where(gte(borrowRecords.issuedAt, sevenDaysAgo))
      .groupBy(sql`DATE(${borrowRecords.issuedAt})`)
      .orderBy(sql`DATE(${borrowRecords.issuedAt})`);

    // Format for Recharts
    const borrowsByDate = recentBorrows.map(b => ({
      date: new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      borrows: Number(b.count)
    }));

    // 2. Popular Categories
    const popCategories = await db
      .select({
        name: categories.name,
        count: sql<number>`count(*)`
      })
      .from(categories)
      .leftJoin(bookCategories, eq(categories.id, bookCategories.categoryId))
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);

    const categoriesChart = popCategories.map(c => ({
      name: c.name,
      books: Number(c.count)
    }));

    // 3. System Stats
    const [[totalBooks], [totalBorrows]] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(books),
      db.select({ count: sql<number>`count(*)` }).from(borrowRecords)
    ]);

    return {
      borrowsByDate,
      categoriesChart,
      stats: {
        totalBooks: Number(totalBooks?.count || 0),
        totalBorrows: Number(totalBorrows?.count || 0)
      }
    };
  }, ["admin-analytics"], { revalidate: 300, tags: ["analytics"] });
}
