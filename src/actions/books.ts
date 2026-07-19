"use server";

import { db } from "@/db";
import { books, authors, publishers, categories, bookAuthors, bookCategories, bookCopies } from "@/db/schema";
import { eq, or, ilike, desc, sql } from "drizzle-orm";
import type { ActionResult } from "@/types";

// ─── Search & List Books ──────────────────────────────────────────────────────

export async function getBooks(options: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  const whereClause = options.search
    ? or(
        ilike(books.title, `%${options.search}%`),
        ilike(books.isbn, `%${options.search}%`)
      )
    : undefined;

  const [[totalRes], results] = await db.batch([
    db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(whereClause),
    db
      .select()
      .from(books)
      .where(whereClause)
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(totalRes.count);
  const totalPages = Math.ceil(total / limit);

  return {
    books: results,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getBookById(id: string) {
  const [book] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return book;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(name: string, description?: string): Promise<ActionResult> {
  try {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1);

    if (existing) {
      return { success: false, message: "Category already exists" };
    }

    await db.insert(categories).values({ name, description });
    return { success: true, message: "Category created successfully" };
  } catch (error) { 
    return { success: false, message: "Failed to create category" };
  }
}

// ─── Publishers ───────────────────────────────────────────────────────────────

export async function getPublishers() {
  return db.select().from(publishers).orderBy(publishers.name);
}

export async function createPublisher(name: string, contact?: string): Promise<ActionResult> {
  try {
    await db.insert(publishers).values({ name, contact });
    return { success: true, message: "Publisher created successfully" };
  } catch (error) { 
    return { success: false, message: "Failed to create publisher" };
  }
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export async function getAuthors() {
  return db.select().from(authors).orderBy(authors.name);
}

export async function createAuthor(name: string, bio?: string): Promise<ActionResult> {
  try {
    await db.insert(authors).values({ name, bio });
    return { success: true, message: "Author created successfully" };
  } catch (error) { 
    return { success: false, message: "Failed to create author" };
  }
}

// ─── Books CRUD ───────────────────────────────────────────────────────────────

export async function createBook(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title") as string;
    const isbn = formData.get("isbn") as string;
    const callNumber = (formData.get("callNumber") as string) || null;
    const publisherId = (formData.get("publisherId") as string) || null;
    const yearStr = formData.get("year") as string;
    const year = yearStr ? parseInt(yearStr, 10) : null;
    const totalCopiesStr = formData.get("totalCopies") as string;
    const totalCopies = totalCopiesStr ? parseInt(totalCopiesStr, 10) : 1;
    const description = (formData.get("description") as string) || null;
    const coverImage = (formData.get("coverImage") as string) || null;
    
    // Arrays for multi-select
    const authorIds = formData.getAll("authorIds") as string[];
    const categoryIds = formData.getAll("categoryIds") as string[];

    if (!title || !isbn) {
      return { success: false, message: "Title and ISBN are required" };
    }

    // Check existing ISBN
    const [existingBook] = await db
      .select()
      .from(books)
      .where(eq(books.isbn, isbn))
      .limit(1);

    if (existingBook) {
      return { success: false, message: "A book with this ISBN already exists" };
    }

    // Insert book
    const [newBook] = await db.insert(books).values({
      title,
      isbn,
      callNumber,
      publisherId,
      year,
      totalCopies,
      availableCopies: totalCopies,
      description,
      coverImage,
    }).returning();

    // Insert authors
    if (authorIds.length > 0) {
      await db.insert(bookAuthors).values(
        authorIds.map((authorId) => ({
          bookId: newBook.id,
          authorId,
        }))
      );
    }

    // Insert categories
    if (categoryIds.length > 0) {
      await db.insert(bookCategories).values(
        categoryIds.map((categoryId) => ({
          bookId: newBook.id,
          categoryId,
        }))
      );
    }

    // Insert physical copies
    if (totalCopies > 0) {
      const copiesData = Array.from({ length: totalCopies }).map((_, i) => {
        const uniquePart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const barcode = `LIB-${isbn.slice(-4)}-${uniquePart}-${i}`;
        return {
          bookId: newBook.id,
          barcode,
        };
      });
      await db.insert(bookCopies).values(copiesData);
    }

    return { success: true, message: "Book created successfully" };
  } catch (error) { 
    console.error("Failed to create book:", error);
    return { success: false, message: "Failed to create book" };
  }
}

// ─── Update Book ──────────────────────────────────────────────────────────────

export async function updateBook(
  bookId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const title = formData.get("title") as string;
    const isbn = formData.get("isbn") as string;
    const callNumber = (formData.get("callNumber") as string) || null;
    const yearStr = formData.get("year") as string;
    const year = yearStr ? parseInt(yearStr, 10) : null;
    const description = (formData.get("description") as string) || null;
    const coverImage = (formData.get("coverImage") as string) || null;

    if (!title || !isbn) {
      return { success: false, message: "Title and ISBN are required" };
    }

    // Check if book exists
    const [existing] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Book not found" };
    }

    // Check for duplicate ISBN (if changed)
    if (isbn !== existing.isbn) {
      const [duplicate] = await db
        .select()
        .from(books)
        .where(eq(books.isbn, isbn))
        .limit(1);

      if (duplicate) {
        return { success: false, message: "Another book with this ISBN already exists" };
      }
    }

    await db
      .update(books)
      .set({
        title,
        isbn,
        callNumber,
        year,
        description,
        coverImage,
      })
      .where(eq(books.id, bookId));

    return { success: true, message: "Book updated successfully" };
  } catch (error) {
    console.error("Failed to update book:", error);
    return { success: false, message: "Failed to update book" };
  }
}

// ─── Delete Book ──────────────────────────────────────────────────────────────

export async function deleteBook(bookId: string): Promise<ActionResult> {
  try {
    const [existing] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!existing) {
      return { success: false, message: "Book not found" };
    }

    // Delete book — cascades to copies, borrows, reservations
    await db.delete(books).where(eq(books.id, bookId));

    return { success: true, message: "Book has been permanently deleted." };
  } catch (error) {
    console.error("Failed to delete book:", error);
    return { success: false, message: "Failed to delete book" };
  }
}
