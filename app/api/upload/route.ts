import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Arquivo muito grande. Máximo 10MB permitido.",
        },
        { status: 413 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB permitido." }, { status: 413 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 })
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const filename = `problem-${timestamp}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)

    if (error instanceof Error) {
      if (error.message.includes("too large") || error.message.includes("size") || error.message.includes("413")) {
        return NextResponse.json({ error: "Arquivo muito grande" }, { status: 413 })
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json({ error: "Timeout no upload. Tente novamente." }, { status: 408 })
      }
    }

    return NextResponse.json({ error: "Falha no upload. Tente novamente." }, { status: 500 })
  }
}
