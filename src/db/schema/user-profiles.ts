import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── User Profiles Table ──────────────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
});
