import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { createId } from "@paralleldrive/cuid2"
import { hashApiKey } from "@/lib/api-auth"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Generate a new API key — store only the hash
  const newKey = `fu_${createId()}`
  const keyHash = hashApiKey(newKey)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      apiKey: null, // Clear legacy plaintext key
      apiKeyHash: keyHash,
    },
  })

  // Return the plaintext key only once — user must save it
  return NextResponse.json({
    apiKey: newKey,
    message: "Save this key now. It will not be shown again.",
  })
}
