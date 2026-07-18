import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── Students Table ───────────────────────────────────────────────────────────

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  studentId: varchar("student_id", { length: 50 }).unique().notNull(),
  department: varchar("department", { length: 100 }),
  course: varchar("course", { length: 100 }),
  year: integer("year"),
});
