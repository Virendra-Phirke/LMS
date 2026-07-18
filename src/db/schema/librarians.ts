import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── Librarians Table ─────────────────────────────────────────────────────────

export const librarians = pgTable("librarians", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  employeeId: varchar("employee_id", { length: 50 }).unique().notNull(),
});
