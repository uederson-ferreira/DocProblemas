"use client"

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
import { updateProblemStatus, saveW5H2Plan, updateProblem, deleteProblem } from "@/lib/actions"
import { useActionState } from "react"
import { PhotoCarousel } from "./photo-carousel"

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
  desmatamento: "Desmatamento",
  seguranca: "Segurança",
  poluicao: "Poluição",
  infraestrutura: "Infraestrutura",
  licenciamento: "Licenciamento",
}

export function ProblemCard({ problem, plan, index, onUpdate, onDelete }: ProblemCardProps) {
  console.log("Problem data:", problem)
  console.log("Problem photos:", problem.photos)
  console.log("Problem problem_photos:", (problem as any).problem_photos)

  const [showW5H2, setShowW5H2] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: problem.title || "",
    description: problem.description,
    type: problem.type,
    severity: problem.severity,
    location: problem.location || "",
  })

  const [w5h2Data, setW5h2Data] = useState({
    what: plan?.what || "",
    why: plan?.why || "",
    when: plan?.when_plan || "",
    where: plan?.where_plan || "",
    who: plan?.who || "",
    how: plan?.how || "",
    howMuch: plan?.how_much || "",
  })

  const [statusState, statusAction] = useActionState(updateProblemStatus, null)
  const [planState, planAction] = useActionState(saveW5H2Plan, null)
  const [updateState, updateAction] = useActionState(updateProblem, null)
  const [deleteState, deleteAction] = useActionState(deleteProblem, null)

  const handleResolvedChange = async (checked: boolean) => {
    const newStatus = checked ? "resolvido" : "pendente"
    const result = await updateProblemStatus(problem.id, newStatus)

    if (!result?.error) {
      onUpdate({
        ...problem,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
    }
  }

  const handleW5H2Toggle = (checked: boolean) => {
    setShowW5H2(checked)
  }

  const handleW5H2Save = async (formData: FormData) => {
    const result = await planAction(formData)

    if (!result?.error) {
      setShowW5H2(false)
      const updatedPlan: W5H2Plan = {
        id: plan?.id || crypto.randomUUID(),
        problem_id: problem.id,
        what: formData.get("what")?.toString() || "",
        why: formData.get("why")?.toString() || "",
        when_plan: formData.get("when")?.toString() || "",
        where_plan: formData.get("where")?.toString() || "",
        who: formData.get("who")?.toString() || "",
        how: formData.get("how")?.toString() || "",
        how_much: formData.get("howMuch")?.toString() || "",
        created_at: plan?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      onUpdate({
        ...problem,
        w5h2_plans: [updatedPlan],
      })
    }
  }

  const handleEditSave = async () => {
    const result = await updateProblem(problem.id, editData)

    if (!result?.error) {
      setIsEditing(false)
      onUpdate({
        ...problem,
        ...editData,
        updated_at: new Date().toISOString(),
      })
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
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                PROBLEMA #{String((problem as any).problem_number || index + 1).padStart(3, "0")}
              </h3>
              {problem.status === "pendente" && (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">NÃO RESOLVIDO</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className={severityConfig[problem.severity].color}>{severityConfig[problem.severity].label}</Badge>
              <Badge variant="outline">{typeConfig[problem.type]}</Badge>
            </div>

            <p className="text-sm text-slate-600">
              📅 {createdDate} às {createdTime} • 📍 {problem.location || "Local não especificado"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="bg-blue-50 p-4 rounded-lg space-y-4">
            <h4 className="font-semibold text-slate-900">Editar Problema</h4>

            {updateState?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{updateState.error}</div>
            )}

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
                <Label htmlFor={`edit-type-${problem.id}`}>Tipo</Label>
                <select
                  id={`edit-type-${problem.id}`}
                  value={editData.type}
                  onChange={(e) => setEditData((prev) => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="desmatamento">Desmatamento</option>
                  <option value="seguranca">Segurança</option>
                  <option value="poluicao">Poluição</option>
                  <option value="infraestrutura">Infraestrutura</option>
                  <option value="licenciamento">Licenciamento</option>
                </select>
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
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEditSave} size="sm">
                Salvar Alterações
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Seção da descrição - lado esquerdo */}
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-2">Descrição do Problema</h4>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap break-words overflow-wrap-anywhere">
                {problem.description}
              </p>
            </div>

            {/* Seção das fotos - lado direito */}
            {((problem.photos && problem.photos.length > 0) ||
              ((problem as any).problem_photos && (problem as any).problem_photos.length > 0)) && (
              <div className="lg:w-80 flex-shrink-0">
                <h4 className="font-semibold text-slate-900 mb-2">Fotos do Problema</h4>
                <PhotoCarousel photos={problem.photos || (problem as any).problem_photos || []} />
                {/* Debug visual */}
                <div className="text-xs text-gray-500 mt-1">
                  Debug: {problem.photos?.length || (problem as any).problem_photos?.length || 0} fotos encontradas
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controles de Resolução e 5W2H */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`resolved-${problem.id}`}
              checked={problem.status === "resolvido"}
              onCheckedChange={handleResolvedChange}
            />
            <Label htmlFor={`resolved-${problem.id}`} className="font-medium">
              Marcar como resolvido
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id={`w5h2-${problem.id}`} checked={showW5H2} onCheckedChange={handleW5H2Toggle} />
            <Label htmlFor={`w5h2-${problem.id}`} className="font-medium">
              Criar plano 5W2H para resolução
            </Label>
            {showW5H2 ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>

          {/* Formulário 5W2H */}
          {showW5H2 && (
            <form action={handleW5H2Save} className="bg-slate-50 p-4 rounded-lg space-y-4">
              <input type="hidden" name="problemId" value={problem.id} />

              <h4 className="font-semibold text-slate-900 mb-3">Plano de Ação 5W2H</h4>

              {planState?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{planState.error}</div>
              )}

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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
