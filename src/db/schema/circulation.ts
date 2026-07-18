import { pgTable, varchar, timestamp, uuid, pgEnum, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { books } from "./books";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const copyStatusEnum = pgEnum("copy_status", [
  "AVAILABLE",
  "BORROWED",
  "RESERVED",
  "LOST",
  "DAMAGED",
]);

export const borrowStatusEnum = pgEnum("borrow_status", [
  "ACTIVE",
  "RETURNED",
  "OVERDUE",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "PENDING",
  "FULFILLED",
  "CANCELLED",
  "EXPIRED",
]);

// ─── Book Copies ───────────────────────────────────────────────────────────────

export const bookCopies = pgTable("book_copies", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  barcode: varchar("barcode", { length: 50 }).notNull().unique(),
  status: copyStatusEnum("status").notNull().default("AVAILABLE"),
  condition: varchar("condition", { length: 100 }), // e.g. "Good", "Fair", "New"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Borrow Records ────────────────────────────────────────────────────────────

export const borrowRecords = pgTable("borrow_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  copyId: uuid("copy_id").notNull().references(() => bookCopies.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  returnedAt: timestamp("returned_at"),
  status: borrowStatusEnum("status").notNull().default("ACTIVE"),
  fineAmount: decimal("fine_amount", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Reservations ──────────────────────────────────────────────────────────────

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedCopyId: uuid("assigned_copy_id").references(() => bookCopies.id, { onDelete: "set null" }),
  status: reservationStatusEnum("status").notNull().default("PENDING"),
  reservedAt: timestamp("reserved_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"), // set when a copy is assigned
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const bookCopiesRelations = relations(bookCopies, ({ one, many }) => ({
  book: one(books, {
    fields: [bookCopies.bookId],
    references: [books.id],
  }),
  borrowRecords: many(borrowRecords),
  reservations: many(reservations),
}));

export const borrowRecordsRelations = relations(borrowRecords, ({ one }) => ({
  copy: one(bookCopies, {
    fields: [borrowRecords.copyId],
    references: [bookCopies.id],
  }),
  user: one(users, {
    fields: [borrowRecords.userId],
    references: [users.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  book: one(books, {
    fields: [reservations.bookId],
    references: [books.id],
  }),
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  assignedCopy: one(bookCopies, {
    fields: [reservations.assignedCopyId],
    references: [bookCopies.id],
  }),
}));
