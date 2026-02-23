"use client"

import { useEffect, useState, useCallback } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, Palette } from "lucide-react"

interface QrPreviewProps {
  url: string
  compact?: boolean
}

export function QrPreview({ url, compact = false }: QrPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [size, setSize] = useState(200)
  const [fgColor, setFgColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#ffffff")
  const [showOptions, setShowOptions] = useState(false)

  const generateQr = useCallback(async () => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      })
      setQrDataUrl(dataUrl)
    } catch {
      // Ignore QR generation errors
    }
  }, [url, size, fgColor, bgColor])

  useEffect(() => {
    generateQr()
  }, [generateQr])

  function handleDownloadPng() {
    if (!qrDataUrl) return
    const link = document.createElement("a")
    link.download = `fattyurl-qr-${size}px.png`
    link.href = qrDataUrl
    link.click()
  }

  async function handleDownloadSvg() {
    try {
      const svgString = await QRCode.toString(url, {
        type: "svg",
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      })
      const blob = new Blob([svgString], { type: "image/svg+xml" })
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `fattyurl-qr.svg`
      link.href = blobUrl
      link.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Ignore SVG generation errors
    }
  }

  if (!qrDataUrl) return null

  if (compact) {
    return (
      <div className="flex items-center gap-4 pt-2">
        <img src={qrDataUrl} alt="QR Code" className="rounded-lg" width={120} height={120} />
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPng}>
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSvg}>
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-lg border p-3 bg-white">
          <img src={qrDataUrl} alt="QR Code" className="rounded" width={160} height={160} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPng}>
              <Download className="h-4 w-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadSvg}>
              <Download className="h-4 w-4 mr-2" />
              Download SVG
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Palette className="h-3.5 w-3.5" />
            {showOptions ? "Hide options" : "Customize QR code"}
          </button>

          {showOptions && (
            <div className="space-y-3 rounded-lg border p-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Size (px)</Label>
                <div className="flex gap-1.5">
                  {[200, 400, 600, 1000].map((s) => (
                    <Button
                      key={s}
                      variant={size === s ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Foreground</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-8 w-20 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-8 w-20 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
