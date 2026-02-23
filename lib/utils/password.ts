import bcrypt from "bcryptjs"

const ROUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS)
}

/**
 * Verify a password against a stored hash.
 * Supports legacy plaintext passwords — auto-detects and uses plaintext
 * comparison as fallback for passwords that aren't bcrypt hashes.
 */
export async function verifyPassword(
  plain: string,
  stored: string
): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  // Detect bcrypt hash format ($2a$ or $2b$)
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    const valid = await bcrypt.compare(plain, stored)
    return { valid, needsUpgrade: false }
  }

  // Legacy plaintext fallback
  const valid = plain === stored
  return { valid, needsUpgrade: valid } // flag for silent upgrade
}
