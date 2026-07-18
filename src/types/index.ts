// ─── User Types ───────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "LIBRARIAN" | "STUDENT";
export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
export type OTPType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

// ─── Session Payload ──────────────────────────────────────────────────────────

export interface SessionPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  jti: string; // session JWT ID
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
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
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
