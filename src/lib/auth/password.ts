import "server-only";

import { hash, verify } from "@node-rs/argon2";

// ─── Password Hashing ─────────────────────────────────────────────────────────

/**
 * Hash a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

/**
 * Verify a plaintext password against an Argon2id hash.
 */
export async function verifyPassword(
  storedHash: string,
  password: string
): Promise<boolean> {
  try {
    return await verify(storedHash, password);
  } catch {
    return false;
  }
}

// ─── Password Strength Validation ─────────────────────────────────────────────

interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validates password against strength requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export function validatePasswordStrength(
  password: string
): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
