import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "LIBRARIAN",
  "STUDENT",
]);

export const userStatusEnum = pgEnum("user_status", [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "DEACTIVATED",
]);

// ─── Users Table ──────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").default("PENDING").notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
}, (t) => [
  index("user_email_role_idx").on(t.email, t.role)
]);
