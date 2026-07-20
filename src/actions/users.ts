"use server";

import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, userProfiles, students, librarians } from "@/db/schema";
import { eq, or, like, sql, and, desc } from "drizzle-orm";
import {
  createLibrarianSchema,
  createStudentSchema,
} from "@/lib/validations/user";
import type { ActionResult, UserRole } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<ActionResult | null> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "ADMIN") {
    return {
      success: false,
      message: "Unauthorized. Admin access required.",
    };
  }
  return null;
}

function generateEmployeeId(): string {
  const prefix = "LIB";
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random}`;
}

// ─── Setup Student Profile ──────────────────────────────────────────────────────

export async function setupStudentProfile(): Promise<ActionResult> {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { success: false, message: "Not authenticated" };
  }

  // Check if Clerk user already has a DB record
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (existingUser) {
    return { success: true, message: "Account already set up." };
  }

  // Generate a random student ID since we skipped onboarding
  const studentId = `STU-${Math.floor(10000 + Math.random() * 90000)}`;

  // Create user record
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      role: "STUDENT",
      status: "ACTIVE",
    })
    .returning();

  const fullName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Student";

  // Create profile
  await db.insert(userProfiles).values({
    userId: newUser.id,
    fullName,
  });

  // Create student record
  await db.insert(students).values({
    userId: newUser.id,
    studentId,
  });
  // Set role in Clerk metadata (so middleware can read it from session)
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUser.id, {
    publicMetadata: { role: "STUDENT" },
  });

  return { success: true, message: "Profile created" };
}

// ─── Create Librarian ─────────────────────────────────────────────────────────

export async function createLibrarian(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const rawData = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phone: (formData.get("phone") as string) || "",
  };

  const validated = createLibrarianSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { fullName, email, phone } = validated.data;

  // Check if email already exists in DB
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing) {
    return {
      success: false,
      message: "An account with this email already exists",
    };
  }

  // Create user record (no clerkId yet — will be linked when librarian signs up via Clerk)
  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      role: "LIBRARIAN",
      status: "PENDING",
    })
    .returning();

  // Create profile
  await db.insert(userProfiles).values({
    userId: newUser.id,
    fullName,
    phone: phone || null,
  });

  // Create librarian record
  await db.insert(librarians).values({
    userId: newUser.id,
    employeeId: generateEmployeeId(),
  });

  return {
    success: true,
    message: `Librarian account created for ${fullName}. They can sign up via Clerk to activate.`,
  };
}

// ─── Create Student (Admin) ──────────────────────────────────────────────────

export async function createStudent(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const rawData = {
    studentId: formData.get("studentId") as string,
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    department: (formData.get("department") as string) || "",
    course: (formData.get("course") as string) || "",
    phone: (formData.get("phone") as string) || "",
  };

  const validated = createStudentSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      success: false,
      message: "Invalid input",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { studentId, fullName, email, department, course, phone } =
    validated.data;

  // Check if email already exists
  const [existingEmail] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existingEmail) {
    return {
      success: false,
      message: "An account with this email already exists",
    };
  }

  // Check if student ID already exists
  const [existingStudentId] = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.studentId, studentId))
    .limit(1);

  if (existingStudentId) {
    return {
      success: false,
      message: "A student with this ID already exists",
    };
  }

  // Create user (no clerkId — will be linked when student signs up)
  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      role: "STUDENT",
      status: "PENDING",
    })
    .returning();

  // Create profile
  await db.insert(userProfiles).values({
    userId: newUser.id,
    fullName,
    phone: phone || null,
  });

  // Create student record
  await db.insert(students).values({
    userId: newUser.id,
    studentId,
    department: department || null,
    course: course || null,
  });

  return {
    success: true,
    message: `Student account created for ${fullName}. They can sign up via Clerk to activate.`,
  };
}

// ─── Suspend User ─────────────────────────────────────────────────────────────

export async function suspendUser(userId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await db
    .update(users)
    .set({ status: "SUSPENDED" })
    .where(eq(users.id, userId));

  return {
    success: true,
    message: "User has been suspended.",
  };
}

// ─── Activate User ───────────────────────────────────────────────────────────

export async function activateUser(userId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await db
    .update(users)
    .set({ status: "ACTIVE" })
    .where(eq(users.id, userId));

  return {
    success: true,
    message: "User has been activated.",
  };
}

// ─── Deactivate User ─────────────────────────────────────────────────────────

export async function deactivateUser(userId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  await db
    .update(users)
    .set({ status: "DEACTIVATED" })
    .where(eq(users.id, userId));

  return {
    success: true,
    message: "User has been deactivated.",
  };
}

// ─── Get Users (Paginated) ───────────────────────────────────────────────────

export async function getUsers(options?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: string;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const offset = (page - 1) * limit;

  // Build conditions
  const conditions = [];

  if (options?.role) {
    conditions.push(eq(users.role, options.role));
  }

  if (options?.status) {
    conditions.push(
      eq(
        users.status,
        options.status as "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
      )
    );
  }

  if (options?.search) {
    const searchTerm = `%${options.search}%`;
    conditions.push(
      or(
        like(users.email, searchTerm),
        like(userProfiles.fullName, searchTerm)
      )!
    );
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count and paginated results in a single batched network request
  const [[countResult], result] = await db.batch([
    db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(whereClause),
    db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        fullName: userProfiles.fullName,
        phone: userProfiles.phone,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult?.count || 0);

  return {
    users: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ─── Get User By ID ──────────────────────────────────────────────────────────

export async function getUserById(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  let studentData = null;
  let librarianData = null;

  if (user.role === "STUDENT") {
    const [s] = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId))
      .limit(1);
    studentData = s || null;
  }

  if (user.role === "LIBRARIAN") {
    const [l] = await db
      .select()
      .from(librarians)
      .where(eq(librarians.userId, userId))
      .limit(1);
    librarianData = l || null;
  }

  return {
    ...user,
    profile: profile || null,
    student: studentData,
    librarian: librarianData,
  };
}

// ─── Update User ─────────────────────────────────────────────────────────────

export async function updateUser(
  userId: string,
  data: {
    fullName?: string;
    phone?: string;
    department?: string;
    course?: string;
  }
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // Update profile fields
    if (data.fullName || data.phone !== undefined) {
      const profileUpdate: Record<string, string | null> = {};
      if (data.fullName) profileUpdate.fullName = data.fullName;
      if (data.phone !== undefined)
        profileUpdate.phone = data.phone || null;

      await db
        .update(userProfiles)
        .set(profileUpdate)
        .where(eq(userProfiles.userId, userId));
    }

    // Update student-specific fields
    if (
      user.role === "STUDENT" &&
      (data.department !== undefined || data.course !== undefined)
    ) {
      const studentUpdate: Record<string, string | null> = {};
      if (data.department !== undefined)
        studentUpdate.department = data.department || null;
      if (data.course !== undefined)
        studentUpdate.course = data.course || null;

      await db
        .update(students)
        .set(studentUpdate)
        .where(eq(students.userId, userId));
    }

    return {
      success: true,
      message: "User updated successfully.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to update user.",
    };
  }
}

// ─── Delete User ─────────────────────────────────────────────────────────────

export async function deleteUser(userId: string): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    // Verify user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return { success: false, message: "User not found." };
    }

    // Prevent deleting admins
    if (user.role === "ADMIN") {
      return {
        success: false,
        message: "Cannot delete admin accounts.",
      };
    }

    // Delete user — cascades to profile, student/librarian record, etc.
    await db.delete(users).where(eq(users.id, userId));

    return {
      success: true,
      message: "User has been permanently deleted.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to delete user.",
    };
  }
}
