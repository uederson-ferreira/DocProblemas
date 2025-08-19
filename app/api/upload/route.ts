import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando upload - Headers:", Object.fromEntries(request.headers.entries()))
    
    const contentLength = request.headers.get("content-length")
    if (contentLength && Number.parseInt(contentLength) > 10 * 1024 * 1024) {
      const fileSizeMB = (Number.parseInt(contentLength) / (1024 * 1024)).toFixed(1)
      console.log(`Arquivo rejeitado - muito grande: ${contentLength} bytes (${fileSizeMB}MB)`)
      return NextResponse.json(
        {
          error: `Foto muito grande! O arquivo tem ${fileSizeMB}MB. O tamanho máximo permitido é 10MB. Tente comprimir a imagem antes de fazer o upload.`,
        },
        { status: 413 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("Nenhum arquivo fornecido")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`Arquivo recebido: ${file.name}, tamanho: ${file.size} bytes, tipo: ${file.type}`)

    if (file.size > 10 * 1024 * 1024) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      console.log(`Arquivo rejeitado - muito grande: ${file.size} bytes (${fileSizeMB}MB)`)
      return NextResponse.json({ 
        error: `Foto muito grande! ${file.name} tem ${fileSizeMB}MB. O tamanho máximo permitido é 10MB. Tente comprimir a imagem antes de fazer o upload.` 
      }, { status: 413 })
    }

    if (!file.type.startsWith("image/")) {
      console.log(`Arquivo rejeitado - tipo inválido: ${file.type}`)
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 })
    }

    // Check if Vercel Blob token is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN não configurado")
      return NextResponse.json({ error: "Configuração de upload não disponível" }, { status: 500 })
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const filename = `problem-${timestamp}-${file.name}`

    console.log(`Fazendo upload para Vercel Blob: ${filename}`)

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log(`Upload concluído: ${blob.url}`)

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
      if (error.message.includes("Unauthorized") || error.message.includes("401")) {
        return NextResponse.json({ error: "Token de upload inválido" }, { status: 401 })
      }
    }

    return NextResponse.json({ error: "Falha no upload. Tente novamente." }, { status: 500 })
  }
}
