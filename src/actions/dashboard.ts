"use server";

import { db } from "@/db";
import { users, books, borrowRecords, reservations, userProfiles, bookCopies } from "@/db/schema";
import { eq, sql, and, gte, desc } from "drizzle-orm";

import { withCache } from "@/lib/cache";

// ─── Admin Dashboard Stats ────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  return withCache(async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      [userCount],
      [bookCount],
      [activeBorrows],
      [pendingReservations],
      [overdueCount],
      [newUsersWeek],
    ] = await db.batch([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(books),
      db.select({ count: sql<number>`count(*)` }).from(borrowRecords).where(eq(borrowRecords.status, "ACTIVE")),
      db.select({ count: sql<number>`count(*)` }).from(reservations).where(eq(reservations.status, "PENDING")),
      db.select({ count: sql<number>`count(*)` }).from(borrowRecords).where(eq(borrowRecords.status, "OVERDUE")),
      db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, oneWeekAgo)),
    ]);

    return {
      totalUsers: Number(userCount?.count || 0),
      totalBooks: Number(bookCount?.count || 0),
      activeBorrows: Number(activeBorrows?.count || 0),
      pendingReservations: Number(pendingReservations?.count || 0),
      overdueBooks: Number(overdueCount?.count || 0),
      newUsersThisWeek: Number(newUsersWeek?.count || 0),
    };
  }, ["admin-dash-stats"], { revalidate: 60, tags: ["dashboard", "admin"] });
}

// ─── Admin Recent Activity ────────────────────────────────────────────────────

export async function getAdminRecentActivity() {
  return withCache(async () => {
    const recentBorrows = await db
      .select({
        id: borrowRecords.id,
        status: borrowRecords.status,
        issuedAt: borrowRecords.issuedAt,
        returnedAt: borrowRecords.returnedAt,
        userName: userProfiles.fullName,
        copyBarcode: bookCopies.barcode,
      })
      .from(borrowRecords)
      .leftJoin(userProfiles, eq(borrowRecords.userId, userProfiles.userId))
      .leftJoin(bookCopies, eq(borrowRecords.copyId, bookCopies.id))
      .orderBy(desc(borrowRecords.createdAt))
      .limit(5);

    return recentBorrows.map((r) => ({
      id: r.id,
      type: r.returnedAt ? ("return" as const) : ("borrow" as const),
      userName: r.userName || "Unknown",
      barcode: r.copyBarcode || "N/A",
      timestamp: r.returnedAt || r.issuedAt,
      status: r.status,
    }));
  }, ["admin-recent-activity"], { revalidate: 30, tags: ["dashboard", "admin"] });
}

// ─── Librarian Dashboard Stats ──────────────────────────────────────────────────────

export async function getLibrarianDashboardStats() {
  return withCache(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      [pendingRes],
      [overdue],
      [issuedToday],
      [totalFines]
    ] = await db.batch([
      db.select({ count: sql<number>`count(*)` }).from(reservations).where(eq(reservations.status, "PENDING")),
      db.select({ count: sql<number>`count(*)` }).from(borrowRecords).where(eq(borrowRecords.status, "OVERDUE")),
      db.select({ count: sql<number>`count(*)` }).from(borrowRecords).where(gte(borrowRecords.issuedAt, today)),
      db.select({ count: sql<number>`sum(${borrowRecords.fineAmount})` }).from(borrowRecords).where(eq(borrowRecords.status, "ACTIVE")),
    ]);

    return {
      pendingReservations: Number(pendingRes?.count || 0),
      overdueBooks: Number(overdue?.count || 0),
      issuedToday: Number(issuedToday?.count || 0),
      unpaidFinesCount: Number(totalFines?.count || 0), // Note: Using sum of fines here instead of count
    };
  }, ["librarian-dash-stats"], { revalidate: 30, tags: ["dashboard", "librarian"] });
}

// ─── Student Dashboard Stats ───────────────────────────────────────────────────────

export async function getStudentDashboardStats(userId: string) {
  return withCache(async () => {
    const [
      [activeBorrows],
      [pendingReservations],
      [unpaidFines]
    ] = await db.batch([
      db.select({ count: sql<number>`count(*)` })
        .from(borrowRecords)
        .where(and(eq(borrowRecords.userId, userId), eq(borrowRecords.status, "ACTIVE"))),
      db.select({ count: sql<number>`count(*)` })
        .from(reservations)
        .where(and(eq(reservations.userId, userId), eq(reservations.status, "PENDING"))),
      db.select({ amount: sql<number>`sum(${borrowRecords.fineAmount})` })
        .from(borrowRecords)
        .where(and(eq(borrowRecords.userId, userId), eq(borrowRecords.status, "ACTIVE"))),
    ]);

    return {
      activeBorrows: Number(activeBorrows?.count || 0),
      pendingReservations: Number(pendingReservations?.count || 0),
      unpaidFinesTotal: Number(unpaidFines?.amount || 0),
      finesCount: 0,
    };
  }, [`student-dash-${userId}`], { revalidate: 30, tags: ["dashboard", `student-${userId}`] });
}
