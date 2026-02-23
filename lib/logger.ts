/**
 * Structured logger — JSON in production, formatted in development.
 * Drop-in replacement for console.log/error/warn.
 */

type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  [key: string]: unknown
}

const isProduction = process.env.NODE_ENV === "production"

function createEntry(
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  }
}

function output(entry: LogEntry) {
  if (isProduction) {
    // JSON output for log aggregators (Datadog, CloudWatch, etc.)
    const fn = entry.level === "error" ? console.error : entry.level === "warn" ? console.warn : console.log
    fn(JSON.stringify(entry))
  } else {
    // Human-readable in dev
    const prefix = {
      info: "\x1b[36mINFO\x1b[0m",
      warn: "\x1b[33mWARN\x1b[0m",
      error: "\x1b[31mERROR\x1b[0m",
      debug: "\x1b[90mDEBUG\x1b[0m",
    }[entry.level]

    const { level: _level, message, timestamp: _ts, ...rest } = entry
    const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : ""
    const fn = entry.level === "error" ? console.error : entry.level === "warn" ? console.warn : console.log
    fn(`${prefix} ${message}${extra}`)
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    output(createEntry("info", message, meta))
  },
  warn(message: string, meta?: Record<string, unknown>) {
    output(createEntry("warn", message, meta))
  },
  error(message: string, meta?: Record<string, unknown>) {
    output(createEntry("error", message, meta))
  },
  debug(message: string, meta?: Record<string, unknown>) {
    if (!isProduction) {
      output(createEntry("debug", message, meta))
    }
  },
}
