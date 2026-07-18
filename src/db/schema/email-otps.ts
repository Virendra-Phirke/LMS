import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── OTP Type Enum ────────────────────────────────────────────────────────────

export const otpTypeEnum = pgEnum("otp_type", [
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
]);

// ─── Email OTPs Table ─────────────────────────────────────────────────────────

export const emailOtps = pgTable("email_otps", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  otpCode: varchar("otp_code", { length: 6 }).notNull(),
  type: otpTypeEnum("type").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
