"use client"

import { useState } from "react"
import { Upload, X, Camera, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { compressIfNeeded, formatFileSize, needsCompression } from "@/lib/image-compression"
import { Label } from "@/components/ui/label"

interface Photo {
  id: string
  photo_url: string
  filename: string
  photo_type?: 'problem' | 'resolution'
}

interface UploadedPhoto {
  url: string
  filename: string
  file?: File
  photo_type?: 'problem' | 'resolution'
}

interface PhotoEditProps {
  photos: Photo[]
  onPhotosChange: (photos: UploadedPhoto[]) => void
  photoType: 'problem' | 'resolution'
  maxPhotos?: number
  title?: string
  description?: string
}

export function PhotoEdit({ 
  photos, 
  onPhotosChange, 
  photoType = 'problem',
  maxPhotos = 5,
  title = "Fotos",
  description = "Adicione ou remova fotos"
}: PhotoEditProps) {
  const [uploading, setUploading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState("")

  // Filtrar fotos por tipo
  const currentPhotos = photos.filter(photo => 
    photo.photo_type === photoType || (!photo.photo_type && photoType === 'problem')
  )

  // Converter fotos existentes para formato UploadedPhoto
  const existingPhotos: UploadedPhoto[] = currentPhotos.map(photo => ({
    url: photo.photo_url,
    filename: photo.filename,
    photo_type: photoType,
    id: photo.id
  }))

  const handleFileSelect = async (files: FileList) => {
    if (existingPhotos.length + files.length > maxPhotos) {
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
      const originalFile = files[i]

      if (!originalFile.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: "Apenas imagens são permitidas",
          variant: "destructive",
        })
        continue
      }

      let file = originalFile

      // Verificar se precisa comprimir
      if (needsCompression(originalFile)) {
        try {
          setCompressing(true)
          setCompressionStatus(`Comprimindo ${originalFile.name}...`)
          
          const compressionResult = await compressIfNeeded(originalFile, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            maxSizeBytes: 8 * 1024 * 1024,
            outputFormat: 'jpeg'
          })

          file = compressionResult.file

          if (compressionResult.compressionRatio > 0) {
            toast({
              title: "🔧 Foto comprimida automaticamente!",
              description: `${originalFile.name}: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(compressionResult.compressedSize)} (${compressionResult.compressionRatio}% menor)`,
              variant: "default",
            })
          }

          setCompressing(false)
          setCompressionStatus("")
        } catch (error) {
          setCompressing(false)
          setCompressionStatus("")
          console.error("Erro na compressão:", error)
          toast({
            title: "Erro na compressão",
            description: `Não foi possível comprimir ${originalFile.name}. Tentando upload original...`,
            variant: "destructive",
          })
          file = originalFile
        }
      }

      // Verificar novamente após compressão
      if (file.size > 10 * 1024 * 1024) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
        toast({
          title: "📸 Foto ainda muito grande!",
          description: `${file.name} tem ${fileSizeMB}MB mesmo após compressão. Tente usar uma imagem menor.`,
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

          try {
            const contentType = response.headers.get("content-type")
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json()
              errorMessage = errorData.error || errorMessage
            } else {
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
          photo_type: photoType,
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

    onPhotosChange([...existingPhotos, ...newPhotos])
    setUploading(false)
  }

  const removePhoto = (index: number) => {
    const updatedPhotos = existingPhotos.filter((_, i) => i !== index)
    onPhotosChange(updatedPhotos)
    
    toast({
      title: "Foto removida",
      description: "A foto foi removida da lista",
      variant: "default",
    })
  }

  const getPhotoTypeIcon = () => {
    return photoType === 'problem' ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />
  }

  const getPhotoTypeColor = () => {
    return photoType === 'problem' ? 'text-orange-600' : 'text-green-600'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            {getPhotoTypeIcon()}
            {title}
          </Label>
          {description && (
            <span className="text-xs text-gray-500">({description})</span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {existingPhotos.length}/{maxPhotos}
        </span>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.multiple = true
          input.accept = 'image/*'
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement
            if (target.files) {
              handleFileSelect(target.files)
            }
          }
          input.click()
        }}
      >
        {compressing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
            <p className="text-sm text-orange-600 font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Comprimindo fotos...
            </p>
            {compressionStatus && (
              <p className="text-xs text-gray-500 mt-1">{compressionStatus}</p>
            )}
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Enviando fotos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {getPhotoTypeIcon()}
            <p className="text-sm text-gray-600 mt-2">Clique para adicionar fotos</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</p>
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${getPhotoTypeColor()}`}>
              <Upload className="h-3 w-3" />
              Compressão automática para fotos grandes
            </p>
            <p className="text-xs text-red-600 font-medium">⚠️ Máximo 10MB por foto</p>
          </div>
        )}
      </div>

      {/* Photo preview grid */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingPhotos.map((photo, index) => (
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
                <Trash2 className="h-3 w-3" />
              </Button>
              <div className={`absolute bottom-1 left-1 text-xs px-2 py-1 rounded text-white ${
                photoType === 'problem' ? 'bg-orange-600' : 'bg-green-600'
              }`}>
                {photoType === 'problem' ? 'Antes' : 'Depois'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
