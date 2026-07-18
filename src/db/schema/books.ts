import { pgTable, text, varchar, timestamp, integer, uuid, unique, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Publishers ───────────────────────────────────────────────────────────────

export const publishers = pgTable("publishers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Authors ──────────────────────────────────────────────────────────────────

export const authors = pgTable("authors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Books ────────────────────────────────────────────────────────────────────

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  isbn: varchar("isbn", { length: 13 }).notNull().unique(),
  callNumber: varchar("call_number", { length: 50 }).unique(),
  publisherId: uuid("publisher_id").references(() => publishers.id, { onDelete: "set null" }),
  year: integer("year"),
  totalCopies: integer("total_copies").notNull().default(1),
  availableCopies: integer("available_copies").notNull().default(1),
  description: text("description"),
  coverImage: text("cover_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("book_title_idx").on(t.title)
]);

// ─── Junction Tables ─────────────────────────────────────────────────────────

export const bookAuthors = pgTable("book_authors", {
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => authors.id, { onDelete: "cascade" }),
}, (t) => [
  unique("book_author_idx").on(t.bookId, t.authorId)
]);

export const bookCategories = pgTable("book_categories", {
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (t) => [
  unique("book_category_idx").on(t.bookId, t.categoryId)
]);

// ─── Relations ───────────────────────────────────────────────────────────────

export const booksRelations = relations(books, ({ one, many }) => ({
  publisher: one(publishers, {
    fields: [books.publisherId],
    references: [publishers.id],
  }),
  authors: many(bookAuthors),
  categories: many(bookCategories),
}));

export const publishersRelations = relations(publishers, ({ many }) => ({
  books: many(books),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(bookAuthors),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  books: many(bookCategories),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookAuthors.authorId],
    references: [authors.id],
  }),
}));

export const bookCategoriesRelations = relations(bookCategories, ({ one }) => ({
  book: one(books, {
    fields: [bookCategories.bookId],
    references: [books.id],
  }),
  category: one(categories, {
    fields: [bookCategories.categoryId],
    references: [categories.id],
  }),
}));
