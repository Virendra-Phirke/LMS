"use server";

import { db } from "@/db";
import {
  books,
  bookCopies,
  borrowRecords,
  reservations,
  users,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { ActionResult } from "@/types";

const FINE_PER_DAY = 10;
const BORROW_DURATION_DAYS = 14;

// ─── Issue Book ───────────────────────────────────────────────────────────────

export async function issueBook(
  userId: string,
  barcode: string
): Promise<ActionResult> {
  try {
    // Check user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check copy
    const [copy] = await db
      .select()
      .from(bookCopies)
      .where(eq(bookCopies.barcode, barcode))
      .limit(1);

    if (!copy) {
      return { success: false, message: "Book copy not found" };
    }
    if (copy.status !== "AVAILABLE") {
      return { success: false, message: `Book is currently ${copy.status}` };
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + BORROW_DURATION_DAYS);

    await db.transaction(async (tx) => {
      // 1. Insert borrow record
      await tx.insert(borrowRecords).values({
        copyId: copy.id,
        userId: userId,
        dueDate,
      });

      // 2. Update copy status
      await tx
        .update(bookCopies)
        .set({ status: "BORROWED" })
        .where(eq(bookCopies.id, copy.id));

      // 3. Update book availability
      await tx
        .update(books)
        .set({ availableCopies: sql`available_copies - 1` })
        .where(eq(books.id, copy.bookId));
    });

    return { success: true, message: "Book issued successfully" };
  } catch (error) {
    console.error("Issue book error:", error);
    return { success: false, message: "Failed to issue book" };
  }
}

// ─── Return Book ──────────────────────────────────────────────────────────────

export async function returnBook(barcode: string): Promise<ActionResult> {
  try {
    // Check copy
    const [copy] = await db
      .select()
      .from(bookCopies)
      .where(eq(bookCopies.barcode, barcode))
      .limit(1);

    if (!copy) {
      return { success: false, message: "Book copy not found" };
    }
    if (copy.status !== "BORROWED") {
      return { success: false, message: "This book copy is not currently borrowed" };
    }

    // Find active borrow record
    const [record] = await db
      .select()
      .from(borrowRecords)
      .where(
        and(
          eq(borrowRecords.copyId, copy.id),
          eq(borrowRecords.status, "ACTIVE")
        )
      )
      .limit(1);

    if (!record) {
      return { success: false, message: "No active borrow record found" };
    }

    const returnedAt = new Date();
    let fineAmount = 0;

    if (returnedAt > record.dueDate) {
      const diffTime = Math.abs(returnedAt.getTime() - record.dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * FINE_PER_DAY;
    }

    await db.transaction(async (tx) => {
      // 1. Update borrow record
      await tx
        .update(borrowRecords)
        .set({
          status: "RETURNED",
          returnedAt,
          fineAmount: fineAmount.toFixed(2),
        })
        .where(eq(borrowRecords.id, record.id));

      // 2. Update copy status
      await tx
        .update(bookCopies)
        .set({ status: "AVAILABLE" })
        .where(eq(bookCopies.id, copy.id));

      // 3. Update book availability
      await tx
        .update(books)
        .set({ availableCopies: sql`available_copies + 1` })
        .where(eq(books.id, copy.bookId));
    });

    if (fineAmount > 0) {
      return {
        success: true,
        message: `Book returned successfully. Late fine applied: ₹${fineAmount}`,
      };
    }
    return { success: true, message: "Book returned successfully" };
  } catch (error) {
    console.error("Return book error:", error);
    return { success: false, message: "Failed to return book" };
  }
}

// ─── Reserve Book ─────────────────────────────────────────────────────────────

export async function reserveBook(
  userId: string,
  bookId: string
): Promise<ActionResult> {
  try {
    // Check if user already has pending reservation
    const [existing] = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.bookId, bookId),
          eq(reservations.userId, userId),
          eq(reservations.status, "PENDING")
        )
      )
      .limit(1);

    if (existing) {
      return {
        success: false,
        message: "You already have a pending reservation for this book",
      };
    }

    await db.insert(reservations).values({
      bookId,
      userId,
    });

    return { success: true, message: "Book reserved successfully" };
  } catch (error) {
    console.error("Reserve book error:", error);
    return { success: false, message: "Failed to reserve book" };
  }
}
