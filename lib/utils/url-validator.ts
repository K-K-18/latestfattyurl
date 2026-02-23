const MAX_URL_LENGTH = 2048
const MAX_HOSTNAME_LENGTH = 253

const BLOCKED_HOSTS = [
  "fattyurl.com",
  "www.fattyurl.com",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]

const BLOCKED_PROTOCOLS = ["data:", "javascript:", "file:", "ftp:", "vbscript:"]

const PRIVATE_IP_PATTERNS = [
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fe80:/i,
  /^fc00:/i,
  /^fd[0-9a-f]{2}:/i,
  /^\[::1\]$/,
  /^\[fe80:/i,
  /^\[fc00:/i,
]

function isPrivateIp(hostname: string): boolean {
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname))
}

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (url.length > MAX_URL_LENGTH) {
    return { valid: false, error: `URL too long (max ${MAX_URL_LENGTH} characters)` }
  }

  // Check for blocked protocols before parsing
  const lowerUrl = url.toLowerCase().trim()
  for (const proto of BLOCKED_PROTOCOLS) {
    if (lowerUrl.startsWith(proto)) {
      return { valid: false, error: "This URL protocol is not allowed" }
    }
  }

  try {
    const parsed = new URL(url)

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL must use http or https protocol" }
    }

    if (parsed.hostname.length > MAX_HOSTNAME_LENGTH) {
      return { valid: false, error: "Hostname too long" }
    }

    if (BLOCKED_HOSTS.includes(parsed.hostname)) {
      return { valid: false, error: "This URL is not allowed" }
    }

    if (isPrivateIp(parsed.hostname)) {
      return { valid: false, error: "Private/internal URLs are not allowed" }
    }

    // Block URLs without a valid hostname
    if (!parsed.hostname || parsed.hostname === "") {
      return { valid: false, error: "URL must have a valid hostname" }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: "Invalid URL format" }
  }
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}
