"use client"

import type React from "react"

import { useState } from "react"
import type { Problem, W5H2Plan, Photo } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateProblemStatus, saveW5H2Plan, updateProblem, deleteProblem, createW5H2Plan, resolveProblem, updateProblemPhotos } from "@/lib/actions"
import { PhotoCarousel } from "./photo-carousel"
import { W5H2List } from "./w5h2-list"
import { PhotoEdit } from "./photo-edit"
import { ResolveProblemDialog } from "./resolve-problem-dialog"

interface ProblemCardProps {
  problem: Problem & { w5h2_plans: W5H2Plan[]; photos?: Photo[] }
  plan?: W5H2Plan
  index: number
  onUpdate: (updatedProblem: Problem & { w5h2_plans: W5H2Plan[] }) => void
  onDelete: (problemId: string) => void
}

const severityConfig = {
  critico: { color: "bg-red-500 text-white", label: "Crítico" },
  alto: { color: "bg-orange-500 text-white", label: "Alto" },
  medio: { color: "bg-yellow-500 text-black", label: "Médio" },
  baixo: { color: "bg-green-500 text-white", label: "Baixo" },
}

const typeConfig = {
  meio_ambiente: { label: "Meio Ambiente", color: "bg-green-500 text-white" },
  saude: { label: "Saúde", color: "bg-blue-500 text-white" },
  seguranca: { label: "Segurança", color: "bg-red-500 text-white" },
  outros: { label: "Outros", color: "bg-gray-500 text-white" },
}

// Função para renderizar múltiplos tipos
const renderTypes = (types: string | string[]) => {
  if (!types) return null
  
  const typeArray = Array.isArray(types) ? types : [types]
  
  return typeArray.map((type, index) => (
    <Badge 
      key={index} 
      className={typeConfig[type as keyof typeof typeConfig]?.color || "bg-gray-500 text-white"}
    >
      {typeConfig[type as keyof typeof typeConfig]?.label || type}
    </Badge>
  ))
}

export function ProblemCard({ problem, plan, index, onUpdate, onDelete }: ProblemCardProps) {
  console.log("Problem data:", problem)
  console.log("Problem photos:", problem.photos)
  console.log("Problem problem_photos:", (problem as any).problem_photos)

  const [showW5H2, setShowW5H2] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [editingPhotos, setEditingPhotos] = useState(false)
  const [editData, setEditData] = useState({
    title: problem.title || "",
    description: problem.description,
    recommendations: (problem as any).recommendations || "",
    type: Array.isArray(problem.type) ? problem.type : problem.type.split(',').filter(Boolean),
    severity: problem.severity,
    location: problem.location || "",
    latitude_gms: (problem as any).latitude_gms || "",
    longitude_gms: (problem as any).longitude_gms || "",
  })

  const [w5h2Data, setW5h2Data] = useState({
    what: "",
    why: "",
    when: "",
    where: "",
    who: "",
    how: "",
    howMuch: "",
  })

  const handleResolvedChange = async (checked: boolean) => {
    if (checked && problem.status === "pendente") {
      // Abrir diálogo para marcar como resolvido
      setShowResolveDialog(true)
    } else if (!checked && problem.status === "resolvido") {
      // Marcar como pendente diretamente
      const result = await updateProblemStatus(problem.id, "pendente")
      if (!result?.error) {
        onUpdate({
          ...problem,
          status: "pendente",
          updated_at: new Date().toISOString(),
        })
      }
    }
  }

  const handleResolve = async (data: { 
    resolutionNotes: string
    resolutionPhotos: Array<{
      url: string
      filename: string
      file?: File
      photo_type?: 'problem' | 'resolution'
    }>
  }) => {
    setIsResolving(true)
    
    const result = await resolveProblem(problem.id, {
      resolutionNotes: data.resolutionNotes,
      resolutionPhotos: data.resolutionPhotos.map(photo => ({
        url: photo.url,
        filename: photo.filename
      }))
    })

    if (!result?.error) {
      onUpdate({
        ...problem,
        status: "resolvido",
        updated_at: new Date().toISOString(),
        resolved_at: new Date().toISOString(),
        resolution_notes: data.resolutionNotes,
      })
      setShowResolveDialog(false)
    }
    
    setIsResolving(false)
  }

  const handleW5H2Toggle = (checked: boolean) => {
    setShowW5H2(checked)
  }

  const handleW5H2Save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Converter para FormData como esperado pela função
    const planFormData = new FormData()
    planFormData.append("what", formData.get("what")?.toString() || "")
    planFormData.append("why", formData.get("why")?.toString() || "")
    planFormData.append("when", formData.get("when")?.toString() || "")
    planFormData.append("where", formData.get("where")?.toString() || "")
    planFormData.append("who", formData.get("who")?.toString() || "")
    planFormData.append("how", formData.get("how")?.toString() || "")
    planFormData.append("howMuch", formData.get("howMuch")?.toString() || "")

    const result = await saveW5H2Plan(problem.id, planFormData)
    if (!result?.error) {
      setW5h2Data({
        what: "",
        why: "",
        when: "",
        where: "",
        who: "",
        how: "",
        howMuch: "",
      })
      setShowW5H2(false)
      // Recarregar problemas para mostrar o novo plano
      window.location.reload()
    }
  }

  const handleEditSave = async () => {
    const result = await updateProblem(problem.id, {
      title: editData.title,
      description: editData.description,
      recommendations: editData.recommendations,
      type: Array.isArray(editData.type) ? editData.type.join(',') : editData.type,
      severity: editData.severity,
      location: editData.location,
      latitude_gms: editData.latitude_gms,
      longitude_gms: editData.longitude_gms,
    })

    if (!result?.error) {
      onUpdate({
        ...problem,
        title: editData.title,
        description: editData.description,
        recommendations: editData.recommendations,
        type: Array.isArray(editData.type) ? editData.type.join(',') : editData.type,
        severity: editData.severity,
        location: editData.location,
        updated_at: new Date().toISOString(),
      })
      setIsEditing(false)
    }
  }

  const handlePhotosUpdate = async (photos: Array<{
    url: string
    filename: string
    file?: File
    photo_type?: 'problem' | 'resolution'
  }>) => {
    const result = await updateProblemPhotos(problem.id, photos.map(photo => ({
      url: photo.url,
      filename: photo.filename,
      photo_type: photo.photo_type || 'problem'
    })))

    if (!result?.error) {
      // Recarregar a página para mostrar as fotos atualizadas
      window.location.reload()
    }
  }

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja deletar este problema? Esta ação não pode ser desfeita.")) {
      const result = await deleteProblem(problem.id)

      if (!result?.error) {
        onDelete(problem.id)
      }
    }
  }

  const createdDate = new Date(problem.created_at).toLocaleDateString("pt-BR")
  const createdTime = new Date(problem.created_at).toLocaleTimeString("pt-BR")

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        problem.status === "pendente" && "border-l-4 border-l-red-500 shadow-md",
      )}
    >
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col gap-3 sm:gap-2">
          {/* Linha 1: Número do problema e status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                PROBLEMA #{String((problem as any).problem_number || index + 1).padStart(3, "0")}
              </h3>
              {problem.status === "pendente" && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden xs:inline">NÃO RESOLVIDO</span>
                  <span className="text-xs sm:text-sm font-medium xs:hidden">PENDENTE</span>
                </div>
              )}
            </div>

            {/* Botões de ação - mobile friendly */}
            <div className="flex gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 sm:px-3"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Editar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 bg-transparent p-2 sm:px-3"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1">Excluir</span>
              </Button>
            </div>
          </div>

          {/* Linha 2: Título do Problema */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-slate-800 leading-tight break-words">
              {problem.title}
            </h4>
          </div>

          {/* Linha 3: Badges - stack no mobile */}
          <div className="flex flex-wrap gap-2">
            <Badge className={severityConfig[problem.severity].color}>
              {severityConfig[problem.severity].label}
            </Badge>
            {renderTypes(problem.type)}
          </div>

          {/* Linha 4: Informações de data e local - stack no mobile */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-1">
              📅 {createdDate} às {createdTime}
            </span>
            <span className="hidden xs:inline">•</span>
            <span className="flex items-center gap-1">
              📍 {problem.location || "Local não especificado"}
            </span>
          </div>
          
          {/* Linha 5: Coordenadas (quando disponíveis) */}
          {((problem as any).latitude_gms && (problem as any).longitude_gms) && (
            <div className="text-xs sm:text-sm text-slate-600 break-all">
              🗺️ Coordenadas: {problem.latitude_gms}, {problem.longitude_gms} (GMS)
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-slate-900">Editar Problema</h4>

            {/* updateProblemStatus(problem.id, newStatus) */}
            {/* saveW5H2Plan(problem.id, planData) */}
            {/* updateProblem(problem.id, { ... }) */}
            {/* deleteProblem(problem.id) */}

            {/* updateState?.error */}
            {/* planState?.error */}
            {/* updateState?.error */}
            {/* deleteState?.error */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`edit-title-${problem.id}`}>Título</Label>
                <Input
                  id={`edit-title-${problem.id}`}
                  value={editData.title}
                  onChange={(e) => setEditData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do problema..."
                />
              </div>

              <div>
                <Label htmlFor={`edit-location-${problem.id}`}>Local</Label>
                <Input
                  id={`edit-location-${problem.id}`}
                  value={editData.location}
                  onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="Local do problema..."
                />
              </div>

              <div>
                <Label htmlFor={`edit-latitude-gms-${problem.id}`}>Latitude GMS</Label>
                <Input
                  id={`edit-latitude-gms-${problem.id}`}
                  type="text"
                  value={editData.latitude_gms || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, latitude_gms: e.target.value }))}
                  placeholder="Ex: 02 30 50 S"
                />
              </div>

              <div>
                <Label htmlFor={`edit-longitude-gms-${problem.id}`}>Longitude GMS</Label>
                <Input
                  id={`edit-longitude-gms-${problem.id}`}
                  type="text"
                  value={editData.longitude_gms || ""}
                  onChange={(e) => setEditData((prev) => ({ ...prev, longitude_gms: e.target.value }))}
                  placeholder="Ex: 47 44 39 W"
                />
              </div>

              <div>
                <Label htmlFor={`edit-type-${problem.id}`} className="text-sm font-medium mb-2 block">
                  Tipos do Problema (selecione um ou mais)
                </Label>
                <div className="space-y-2">
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-type-${problem.id}-${key}`}
                        checked={editData.type.includes(key)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditData((prev) => ({
                              ...prev,
                              type: [...prev.type, key]
                            }))
                          } else {
                            setEditData((prev) => ({
                              ...prev,
                              type: prev.type.filter(t => t !== key)
                            }))
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`edit-type-${problem.id}-${key}`}
                        className="text-sm cursor-pointer flex items-center gap-2"
                      >
                        <span className={`inline-block w-3 h-3 rounded-full ${config.color}`}></span>
                        {config.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {editData.type.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Selecione pelo menos um tipo
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor={`edit-severity-${problem.id}`}>Severidade</Label>
                <select
                  id={`edit-severity-${problem.id}`}
                  value={editData.severity}
                  onChange={(e) => setEditData((prev) => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="alto">Alto</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`edit-description-${problem.id}`}>Descrição</Label>
                <Textarea
                  id={`edit-description-${problem.id}`}
                  value={editData.description}
                  onChange={(e) => setEditData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição detalhada do problema..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor={`edit-recommendations-${problem.id}`}>Recomendações</Label>
                <Textarea
                  id={`edit-recommendations-${problem.id}`}
                  value={editData.recommendations}
                  onChange={(e) => setEditData((prev) => ({ ...prev, recommendations: e.target.value }))}
                  placeholder="Suas recomendações para solução..."
                  rows={3}
                />
              </div>
            </div>

            {/* Edição de fotos */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-semibold text-slate-900">Fotos do Problema</h5>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditingPhotos(!editingPhotos)}
                >
                  {editingPhotos ? "Cancelar Edição" : "Editar Fotos"}
                </Button>
              </div>
              
              {editingPhotos ? (
                <PhotoEdit
                  photos={(problem as any).problem_photos || []}
                  onPhotosChange={handlePhotosUpdate}
                  photoType="problem"
                  maxPhotos={5}
                  title="Fotos do Problema"
                  description="Edite as fotos do problema"
                />
              ) : (
                /* Exibição normal das fotos */
                ((problem.photos && problem.photos.length > 0) ||
                 ((problem as any).problem_photos && (problem as any).problem_photos.length > 0)) && (
                  <div>
                    <PhotoCarousel photos={problem.photos || (problem as any).problem_photos || []} />
                  </div>
                )
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleEditSave} size="sm">
                Salvar Alterações
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Layout responsivo: Mobile = empilhado, Desktop = lado a lado */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Descrição e Recomendações - Esquerda no desktop */}
              <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                {/* Descrição do Problema */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">📝 Descrição do Problema</h4>
                  <div className="text-slate-700 bg-slate-50 p-3 rounded-lg text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {problem.description}
                  </div>
                </div>

                {/* Recomendações */}
                {(problem as any).recommendations && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">💡 Recomendações</h4>
                    <div className="text-slate-700 bg-blue-50 p-3 rounded-lg text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words border-l-4 border-l-blue-500">
                      {(problem as any).recommendations}
                    </div>
                  </div>
                )}
              </div>

              {/* Fotos - Direita no desktop, abaixo no mobile */}
              {((problem.photos && problem.photos.length > 0) ||
                ((problem as any).problem_photos && (problem as any).problem_photos.length > 0)) && (
                <div className="lg:w-[500px] lg:flex-shrink-0">
                  <h4 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">📸 Fotos do Problema</h4>
                  <PhotoCarousel photos={problem.photos || (problem as any).problem_photos || []} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controles de Resolução e 5W2H - Mobile Friendly */}
        <div className="border-t pt-3 sm:pt-4 space-y-3 sm:space-y-4">
          {/* Checkbox de resolução */}
          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <Checkbox
              id={`resolved-${problem.id}`}
              checked={problem.status === "resolvido"}
              onCheckedChange={handleResolvedChange}
              className="flex-shrink-0"
            />
            <Label htmlFor={`resolved-${problem.id}`} className="font-medium text-sm sm:text-base cursor-pointer flex-1">
              {problem.status === "resolvido" ? "✅ Problema resolvido" : "Marcar como resolvido"}
            </Label>
          </div>

          {/* Checkbox do plano 5W2H */}
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox 
                id={`w5h2-${problem.id}`} 
                checked={showW5H2} 
                onCheckedChange={handleW5H2Toggle}
                className="flex-shrink-0" 
              />
              <Label htmlFor={`w5h2-${problem.id}`} className="font-medium text-sm sm:text-base cursor-pointer">
                Criar plano 5W2H para resolução
              </Label>
            </div>
            {showW5H2 ? (
              <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
          </div>

          {/* Formulário 5W2H */}
          {showW5H2 && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-6">
              <form onSubmit={handleW5H2Save} className="space-y-4">
                <input type="hidden" name="problemId" value={problem.id} />

                <h4 className="font-semibold text-slate-900 mb-3">Plano de Ação 5W2H</h4>

                {/* planState?.error */}
                {/* saveW5H2Plan(problem.id, planData) */}
                {/* updateProblem(problem.id, { ... }) */}
                {/* deleteProblem(problem.id) */}

                {/* planState?.error */}
                {/* updateState?.error */}
                {/* updateState?.error */}
                {/* deleteState?.error */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`what-${problem.id}`} className="text-sm font-medium">
                      O QUE (What) - O que será feito?
                    </Label>
                    <Textarea
                      id={`what-${problem.id}`}
                      name="what"
                      value={w5h2Data.what}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, what: e.target.value }))}
                      placeholder="Descreva a ação que será tomada..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`why-${problem.id}`} className="text-sm font-medium">
                      POR QUE (Why) - Por que será feito?
                    </Label>
                    <Textarea
                      id={`why-${problem.id}`}
                      name="why"
                      value={w5h2Data.why}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, why: e.target.value }))}
                      placeholder="Justifique a necessidade da ação..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`when-${problem.id}`} className="text-sm font-medium">
                      QUANDO (When) - Quando será feito?
                    </Label>
                    <Input
                      id={`when-${problem.id}`}
                      name="when"
                      value={w5h2Data.when}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, when: e.target.value }))}
                      placeholder="Data/prazo para execução..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`where-${problem.id}`} className="text-sm font-medium">
                      ONDE (Where) - Onde será feito?
                    </Label>
                    <Input
                      id={`where-${problem.id}`}
                      name="where"
                      value={w5h2Data.where}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, where: e.target.value }))}
                      placeholder="Local de execução..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`who-${problem.id}`} className="text-sm font-medium">
                      QUEM (Who) - Quem será responsável?
                    </Label>
                    <Input
                      id={`who-${problem.id}`}
                      name="who"
                      value={w5h2Data.who}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, who: e.target.value }))}
                      placeholder="Responsável pela execução..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`how-${problem.id}`} className="text-sm font-medium">
                      COMO (How) - Como será feito?
                    </Label>
                    <Textarea
                      id={`how-${problem.id}`}
                      name="how"
                      value={w5h2Data.how}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, how: e.target.value }))}
                      placeholder="Método/processo de execução..."
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`howMuch-${problem.id}`} className="text-sm font-medium">
                      QUANTO (How Much) - Quanto custará?
                    </Label>
                    <Input
                      id={`howMuch-${problem.id}`}
                      name="howMuch"
                      value={w5h2Data.howMuch}
                      onChange={(e) => setW5h2Data((prev) => ({ ...prev, howMuch: e.target.value }))}
                      placeholder="Custo estimado..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm">
                    Salvar Plano 5W2H
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowW5H2(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>

              {problem.w5h2_plans && problem.w5h2_plans.length > 0 && (
                <div className="border-t pt-4">
                  <W5H2List
                    plans={problem.w5h2_plans}
                    onUpdate={(updatedPlans) => {
                      onUpdate({
                        ...problem,
                        w5h2_plans: updatedPlans,
                      })
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Diálogo para marcar como resolvido */}
      <ResolveProblemDialog
        open={showResolveDialog}
        onOpenChange={setShowResolveDialog}
        onResolve={handleResolve}
        problemTitle={problem.title}
        isLoading={isResolving}
      />
    </Card>
  )
}
