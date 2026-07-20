import {
  pgTable,
  uuid,
  varchar,
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
  clerkId: varchar("clerk_id", { length: 255 }).unique(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
}, (t) => [
  index("user_email_role_idx").on(t.email, t.role),
  index("user_clerk_id_idx").on(t.clerkId),
]);
