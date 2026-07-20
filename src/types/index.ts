// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "LIBRARIAN" | "STUDENT";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

// ─── Session Payload ──────────────────────────────────────────────────────────

export interface SessionPayload {
  sub: string; // userId (internal DB UUID)
  email: string;
  role: string;
  jti: string;
}

// ─── Action Responses ─────────────────────────────────────────────────────────

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: Record<string, unknown>;
}

// ─── User with Profile ────────────────────────────────────────────────────────

export interface UserWithProfile {
  id: string;
  clerkId: string | null;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    fullName: string;
    phone: string | null;
    avatar: string | null;
  } | null;
  student?: {
    studentId: string;
    department: string | null;
    course: string | null;
    year: number | null;
  } | null;
  librarian?: {
    employeeId: string;
  } | null;
}
