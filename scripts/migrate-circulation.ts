import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running circulation migrations...");

  try {
    // Enums
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "copy_status" AS ENUM('AVAILABLE', 'BORROWED', 'RESERVED', 'LOST', 'DAMAGED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "borrow_status" AS ENUM('ACTIVE', 'RETURNED', 'OVERDUE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "reservation_status" AS ENUM('PENDING', 'FULFILLED', 'CANCELLED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "book_copies" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE cascade,
        "barcode" varchar(50) NOT NULL UNIQUE,
        "status" "copy_status" NOT NULL DEFAULT 'AVAILABLE',
        "condition" varchar(100),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "borrow_records" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "copy_id" uuid NOT NULL REFERENCES "book_copies"("id") ON DELETE cascade,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "issued_at" timestamp NOT NULL DEFAULT now(),
        "due_date" timestamp NOT NULL,
        "returned_at" timestamp,
        "status" "borrow_status" NOT NULL DEFAULT 'ACTIVE',
        "fine_amount" numeric(10, 2) DEFAULT '0.00',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reservations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "book_id" uuid NOT NULL REFERENCES "books"("id") ON DELETE cascade,
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
        "assigned_copy_id" uuid REFERENCES "book_copies"("id") ON DELETE set null,
        "status" "reservation_status" NOT NULL DEFAULT 'PENDING',
        "reserved_at" timestamp NOT NULL DEFAULT now(),
        "expires_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    console.log("Circulation schema created successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
