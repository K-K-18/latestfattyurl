import { headers } from "next/headers"

export async function getGeoData() {
  const headersList = await headers()

  const country = headersList.get("x-vercel-ip-country") || "XX"
  const city = headersList.get("x-vercel-ip-city") || "Unknown"

  return { country, city }
}
