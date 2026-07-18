import { z } from "zod";

// ─── Create Librarian Schema ──────────────────────────────────────────────────

export const createLibrarianSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export type CreateLibrarianInput = z.infer<typeof createLibrarianSchema>;

// ─── Create Student Schema ────────────────────────────────────────────────────

export const createStudentSchema = z.object({
  studentId: z
    .string()
    .min(1, "Student ID is required")
    .max(50, "Student ID is too long"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(255, "Full name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  department: z
    .string()
    .max(100, "Department name is too long")
    .optional()
    .or(z.literal("")),
  course: z
    .string()
    .max(100, "Course name is too long")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
