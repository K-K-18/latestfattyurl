import { ImageResponse } from "next/og"

export const alt = "FattyURL - Free URL Shortener"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const runtime = "edge"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Zap icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "rgba(255,255,255,0.2)",
            marginBottom: 24,
            fontSize: 48,
          }}
        >
          ⚡
        </div>

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-2px",
          }}
        >
          FattyURL
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.9)",
            marginTop: 16,
            fontWeight: 500,
          }}
        >
          Free Forever URL Shortener
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
            fontSize: 18,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          <span>No Ads</span>
          <span>&#x2022;</span>
          <span>No Limits</span>
          <span>&#x2022;</span>
          <span>Full Analytics</span>
          <span>&#x2022;</span>
          <span>QR Codes</span>
          <span>&#x2022;</span>
          <span>API Access</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
