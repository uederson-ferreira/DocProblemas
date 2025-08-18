"use client"

import { useState, useEffect } from "react"
import type { Problem, W5H2Plan } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
    type: [] as string[],
    severity: "medio" as Problem["severity"],
    description: "",
    recommendations: "",
    latitude_gms: "",
    longitude_gms: "",
  })

  const [photos, setPhotos] = useState<UploadedPhoto[]>([])

  const [state, formAction, isPending] = useActionState(createProblem, null)

  useEffect(() => {
    if (state?.success) {
      // Call onAdd to update the problems list
      if (onAdd && state.problem) {
        onAdd(state.problem)
      }
      
      setFormData({
        title: "",
        location: "",
        type: [] as string[],
        severity: "medio",
        description: "",
        recommendations: "",
        latitude_gms: "",
        longitude_gms: "",
      })
      setPhotos([])
      onOpenChange(false)
    }
  }, [state?.success, onOpenChange, onAdd, state?.problem])

  const enhancedFormAction = (formDataObj: FormData) => {
    // Add photos to form data
    photos.forEach((photo, index) => {
      formDataObj.append(`photo_${index}`, photo.url)
      formDataObj.append(`filename_${index}`, photo.filename)
    })
    formDataObj.append("photo_count", photos.length.toString())

    // Add type to form data (CRÍTICO: estava faltando!)
    formData.type.forEach((typeValue) => {
      formDataObj.append("type", typeValue)
    })

    // Add latitude and longitude to form data
    formDataObj.append("latitude_gms", formData.latitude_gms)
    formDataObj.append("longitude_gms", formData.longitude_gms)

    // Call the original form action
    formAction(formDataObj)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Problema</DialogTitle>
        </DialogHeader>

        <form action={enhancedFormAction} className="space-y-4">
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
              <Label htmlFor="latitude_gms" className="text-sm font-medium mb-2 block">Latitude SIRGAS 2000</Label>
              <Input
                id="latitude_gms"
                name="latitude_gms"
                type="text"
                value={formData.latitude_gms}
                onChange={(e) => setFormData((prev) => ({ ...prev, latitude_gms: e.target.value }))}
                placeholder="Ex: 02 30 50 S"
                className="text-lg font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: Graus Minutos Segundos Direção (ex: 02 30 50 S)</p>
            </div>

            <div>
              <Label htmlFor="longitude_gms" className="text-sm font-medium mb-2 block">Longitude SIRGAS 2000</Label>
              <Input
                id="longitude_gms"
                name="longitude_gms"
                type="text"
                value={formData.longitude_gms}
                onChange={(e) => setFormData((prev) => ({ ...prev, longitude_gms: e.target.value }))}
                placeholder="Ex: 47 44 39 W"
                className="text-lg font-mono"
              />
              <p className="text-xs text-center block text-gray-500 mt-1">Formato: Graus Minutos Segundos Direção (ex: 47 44 39 W)</p>
            </div>

            <div>
              <Label htmlFor="type" className="text-sm font-medium mb-2 block">
                Tipos do Problema (selecione um ou mais) *
              </Label>
              <div className="space-y-2">
                {[
                  { key: "meio_ambiente", label: "Meio Ambiente", color: "bg-green-500" },
                  { key: "saude", label: "Saúde", color: "bg-blue-500" },
                  { key: "seguranca", label: "Segurança", color: "bg-red-500" },
                  { key: "outros", label: "Outros", color: "bg-gray-500" }
                ].map((typeOption) => (
                  <div key={typeOption.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${typeOption.key}`}
                      checked={formData.type.includes(typeOption.key)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData((prev) => ({
                            ...prev,
                            type: [...prev.type, typeOption.key]
                          }))
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            type: prev.type.filter(t => t !== typeOption.key)
                          }))
                        }
                      }}
                    />
                    <Label 
                      htmlFor={`type-${typeOption.key}`}
                      className="text-sm cursor-pointer flex items-center gap-2"
                    >
                      <span className={`inline-block w-3 h-3 rounded-full ${typeOption.color}`}></span>
                      {typeOption.label}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.type.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  Selecione pelo menos um tipo
                </p>
              )}
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

          <div>
            <Label htmlFor="recommendations">Recomendações</Label>
            <Textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData((prev) => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Suas recomendações para solução..."
              rows={3}
            />
          </div>

          <PhotoUpload photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Adicionar Problema"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
