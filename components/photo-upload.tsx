"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface UploadedPhoto {
  url: string
  filename: string
  file?: File
}

interface PhotoUploadProps {
  photos: UploadedPhoto[]
  onPhotosChange: (photos: UploadedPhoto[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList) => {
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Limite excedido",
        description: `Máximo de ${maxPhotos} fotos permitidas`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const newPhotos: UploadedPhoto[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas imagens são permitidas",
          variant: "destructive",
        })
        continue
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} excede o limite de 10MB`,
          variant: "destructive",
        })
        continue
      }

      try {
        const formData = new FormData()
        formData.append("file", file)

        console.log(`Iniciando upload de ${file.name} (${file.size} bytes)`)
        
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        console.log(`Resposta do upload: ${response.status} ${response.statusText}`)

        if (!response.ok) {
          let errorMessage = "Upload failed"

          // Tentar ler a resposta como JSON primeiro
          try {
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json()
              errorMessage = errorData.error || errorMessage
            } else {
              // Se não for JSON, ler como texto
              const errorText = await response.text()
              if (errorText.includes("Request Entity Too Large")) {
                errorMessage = "Arquivo muito grande"
              } else if (errorText.includes("Payload Too Large")) {
                errorMessage = "Arquivo muito grande"
              } else {
                errorMessage = errorText || errorMessage
              }
            }
          } catch (parseError) {
            // Se não conseguir ler a resposta, usar mensagem padrão
            errorMessage = `Erro HTTP ${response.status}`
          }

          throw new Error(errorMessage)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Resposta inválida do servidor")
        }

        const result = await response.json()
        console.log(`Upload concluído para ${file.name}:`, result)
        
        newPhotos.push({
          url: result.url,
          filename: result.filename,
          file,
        })
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Erro no upload",
          description: error instanceof Error ? error.message : `Falha ao enviar ${file.name}`,
          variant: "destructive",
        })
      }
    }

    onPhotosChange([...photos, ...newPhotos])
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Fotos do Problema</label>
        <span className="text-xs text-gray-500">
          {photos.length}/{maxPhotos}
        </span>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          disabled={uploading || photos.length >= maxPhotos}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Enviando fotos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Clique para selecionar fotos ou arraste aqui</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG até 10MB cada</p>
          </div>
        )}
      </div>

      {/* Photo preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.filename}
                width={200}
                height={150}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
