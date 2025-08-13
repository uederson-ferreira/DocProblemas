"use client"

import { useState } from "react"
import type { Problem, W5H2Plan } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProblem } from "@/lib/actions"
import { useActionState } from "react"
import { PhotoUpload } from "./photo-upload"

interface UploadedPhoto {
  url: string
  filename: string
  file?: File
}

interface AddProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (problem: Problem & { w5h2_plans: W5H2Plan[] }) => void
}

export function AddProblemDialog({ open, onOpenChange, onAdd }: AddProblemDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "" as Problem["type"],
    severity: "medio" as Problem["severity"],
    description: "",
  })

  const [photos, setPhotos] = useState<UploadedPhoto[]>([])

  const [state, formAction] = useActionState(createProblem, null)

  const handleSubmit = async (formDataObj: FormData) => {
    photos.forEach((photo, index) => {
      formDataObj.append(`photo_${index}`, photo.url)
      formDataObj.append(`filename_${index}`, photo.filename)
    })
    formDataObj.append("photo_count", photos.length.toString())

    const result = await formAction(formDataObj)

    if (!result?.error) {
      // Create a mock problem object for immediate UI update
      const newProblem: Problem & { w5h2_plans: W5H2Plan[] } = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        type: formData.type,
        severity: formData.severity,
        location: formData.location,
        status: "pendente",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "",
        w5h2_plans: [],
      }

      onAdd(newProblem)
      setFormData({
        title: "",
        location: "",
        type: "" as Problem["type"],
        severity: "medio",
        description: "",
      })
      setPhotos([])
      onOpenChange(false)

      // Refresh the page to get the actual data from the server
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Problema</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{state.error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Vazamento de óleo..."
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Setor A, Bloco 2..."
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo do Problema *</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value: Problem["type"]) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seguranca">Segurança</SelectItem>
                  <SelectItem value="desmatamento">Desmatamento</SelectItem>
                  <SelectItem value="poluicao">Poluição</SelectItem>
                  <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="licenciamento">Licenciamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severidade</Label>
              <Select
                name="severity"
                value={formData.severity}
                onValueChange={(value: Problem["severity"]) => setFormData((prev) => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição do Problema *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhadamente o problema encontrado..."
              rows={4}
              required
            />
          </div>

          <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />

          <div className="flex gap-2 pt-4">
            <Button type="submit">Adicionar Problema</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
