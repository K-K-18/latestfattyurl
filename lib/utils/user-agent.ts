import { UAParser } from "ua-parser-js"

export function parseUserAgent(ua: string | null) {
  if (!ua) return { deviceType: null, browser: null, os: null }

  const parser = new UAParser(ua)
  const device = parser.getDevice()
  const browser = parser.getBrowser()
  const os = parser.getOS()

  let deviceType = "desktop"
  if (device.type === "mobile") deviceType = "mobile"
  else if (device.type === "tablet") deviceType = "tablet"

  return {
    deviceType,
    browser: browser.name || null,
    os: os.name || null,
  }
}
