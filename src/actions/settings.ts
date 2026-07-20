"use server";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/auth";

export async function getSystemSettings() {
  const session = await getCurrentUser();
  if (!session) throw new Error("Unauthorized");
  
  const results = await db.select().from(settings);
  const config: Record<string, string> = {};
  
  for (const row of results) {
    config[row.key] = row.value;
  }
  
  return {
    libraryName: config.libraryName || "LMS Central Library",
    idCardTheme: config.idCardTheme || "classicBlue",
    idCardLayout: config.idCardLayout || "classic",
  };
}

export async function updateSystemSettings(data: {
  libraryName: string;
  idCardTheme: string;
  idCardLayout: string;
}) {
  const session = await getCurrentUser();
  if (!session || (session.role !== "ADMIN" && session.role !== "LIBRARIAN")) {
    throw new Error("Unauthorized");
  }

  const updates = [
    { key: "libraryName", value: data.libraryName },
    { key: "idCardTheme", value: data.idCardTheme },
    { key: "idCardLayout", value: data.idCardLayout },
  ];

  for (const item of updates) {
    const existing = await db.select().from(settings).where(eq(settings.key, item.key));
    if (existing.length > 0) {
      await db.update(settings).set({ value: item.value, updatedAt: new Date() }).where(eq(settings.key, item.key));
    } else {
      await db.insert(settings).values({ key: item.key, value: item.value });
    }
  }

  revalidatePath("/admin/id-card-settings");
  revalidatePath("/librarian/id-card-settings");
  return { success: true };
}
