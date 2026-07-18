"use server";

import { db } from "@/db";
import { users, books, borrowRecords, reservations } from "@/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";

import { withCache } from "@/lib/cache";

// ─── Admin Dashboard Stats ────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  return withCache(async () => {
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

    return {
      totalUsers: Number(userCount?.count || 0),
      totalBooks: Number(bookCount?.count || 0),
      activeBorrows: Number(activeBorrows?.count || 0),
      pendingReservations: Number(pendingReservations?.count || 0),
    };
  }, ["admin-dash-stats"], { revalidate: 60, tags: ["dashboard", "admin"] });
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
    ] = await Promise.all([
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
    ] = await Promise.all([
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
