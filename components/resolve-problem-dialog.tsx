"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PhotoEdit } from "./photo-edit"
import { CheckCircle, Camera } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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

interface ResolveProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (data: { 
    resolutionNotes: string
    resolutionPhotos: UploadedPhoto[]
  }) => void
  problemTitle: string
  isLoading?: boolean
}

export function ResolveProblemDialog({ 
  open, 
  onOpenChange, 
  onResolve, 
  problemTitle,
  isLoading = false
}: ResolveProblemDialogProps) {
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [resolutionPhotos, setResolutionPhotos] = useState<UploadedPhoto[]>([])

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, adicione uma observação sobre a resolução do problema.",
        variant: "destructive",
      })
      return
    }

    onResolve({
      resolutionNotes: resolutionNotes.trim(),
      resolutionPhotos
    })

    // Reset form
    setResolutionNotes("")
    setResolutionPhotos([])
    onOpenChange(false)
  }

  const handleCancel = () => {
    setResolutionNotes("")
    setResolutionPhotos([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Marcar Problema como Resolvido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Problema a ser resolvido:</h3>
            <p className="text-green-700">{problemTitle}</p>
          </div>

          <div>
            <Label htmlFor="resolution-notes">
              Observações sobre a Resolução *
            </Label>
            <Textarea
              id="resolution-notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Descreva como o problema foi resolvido, quais ações foram tomadas, etc..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Campo obrigatório - descreva detalhadamente como o problema foi solucionado.
            </p>
          </div>

          <div>
            <PhotoEdit
              photos={[]} // Não há fotos existentes para resolução
              onPhotosChange={setResolutionPhotos}
              photoType="resolution"
              maxPhotos={5}
              title="Fotos da Resolução (Opcional)"
              description="Adicione fotos mostrando o problema resolvido"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Camera className="h-3 w-3" />
              As fotos são opcionais, mas recomendadas para documentar a resolução
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleResolve} 
              disabled={isLoading || !resolutionNotes.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resolvendo...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Resolvido
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
