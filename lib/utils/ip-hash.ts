import { createHmac } from "crypto"

/**
 * Hash an IP address using HMAC-SHA256 with a secret salt.
 * This prevents rainbow table attacks on the IPv4 address space.
 */
export function hashIp(ip: string): string {
  const secret = process.env.IP_HASH_SECRET || "dev-ip-hash-secret-change-in-production"
  return createHmac("sha256", secret).update(ip).digest("hex")
}
