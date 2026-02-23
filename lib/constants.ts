export const RESERVED_SLUGS = [
  "api",
  "dashboard",
  "login",
  "signup",
  "admin",
  "settings",
  "about",
  "pricing",
  "blog",
  "docs",
  "help",
  "support",
  "migrate",
  "terms",
  "privacy",
  "auth",
  "register",
  "account",
  "profile",
  "not-found",
  "link-not-found",
  "p",
]

export const APP_NAME = "FattyURL"
export const APP_DESCRIPTION = "Free forever URL shortener. No ads. No limits. No BS."
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const SLUG_MIN_LENGTH = 3
export const SLUG_MAX_LENGTH = 50
export const SLUG_REGEX = /^[a-zA-Z0-9-]+$/

export const ANONYMOUS_LINK_RETENTION_DAYS = 30
export const LINKS_PER_PAGE = 20
export const CLICKS_PER_PAGE = 100
