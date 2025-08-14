"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Calendar, User, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  description: string
  responsible: string
  due_date?: string
  priority: "baixa" | "media" | "alta" | "critica"
  status: "pendente" | "em_andamento" | "concluida" | "cancelada"
  notes?: string
}

interface ActivityListProps {
  planId: string
  activities: Activity[]
  onUpdate: (activities: Activity[]) => void
}

const priorityConfig = {
  baixa: { color: "bg-gray-500 text-white", label: "Baixa" },
  media: { color: "bg-blue-500 text-white", label: "Média" },
  alta: { color: "bg-orange-500 text-white", label: "Alta" },
  critica: { color: "bg-red-500 text-white", label: "Crítica" },
}

const statusConfig = {
  pendente: { color: "bg-gray-100 text-gray-800", label: "Pendente" },
  em_andamento: { color: "bg-blue-100 text-blue-800", label: "Em Andamento" },
  concluida: { color: "bg-green-100 text-green-800", label: "Concluída" },
  cancelada: { color: "bg-red-100 text-red-800", label: "Cancelada" },
}

export function ActivityList({ planId, activities, onUpdate }: ActivityListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    responsible: "",
    due_date: "",
    priority: "media" as Activity["priority"],
    notes: "",
  })

  const handleAdd = () => {
    if (!formData.description.trim() || !formData.responsible.trim()) return

    const newActivity: Activity = {
      id: crypto.randomUUID(),
      description: formData.description,
      responsible: formData.responsible,
      due_date: formData.due_date || undefined,
      priority: formData.priority,
      status: "pendente",
      notes: formData.notes || undefined,
    }

    onUpdate([...activities, newActivity])
    setFormData({
      description: "",
      responsible: "",
      due_date: "",
      priority: "media",
      notes: "",
    })
    setShowAddForm(false)
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setFormData({
      description: activity.description,
      responsible: activity.responsible,
      due_date: activity.due_date || "",
      priority: activity.priority,
      notes: activity.notes || "",
    })
  }

  const handleSaveEdit = () => {
    if (!formData.description.trim() || !formData.responsible.trim()) return

    const updatedActivities = activities.map((activity) =>
      activity.id === editingId
        ? {
            ...activity,
            description: formData.description,
            responsible: formData.responsible,
            due_date: formData.due_date || undefined,
            priority: formData.priority,
            notes: formData.notes || undefined,
          }
        : activity,
    )

    onUpdate(updatedActivities)
    setEditingId(null)
    setFormData({
      description: "",
      responsible: "",
      due_date: "",
      priority: "media",
      notes: "",
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta atividade?")) {
      onUpdate(activities.filter((activity) => activity.id !== id))
    }
  }

  const handleStatusChange = (id: string, newStatus: Activity["status"]) => {
    const updatedActivities = activities.map((activity) =>
      activity.id === id ? { ...activity, status: newStatus } : activity,
    )
    onUpdate(updatedActivities)
  }

  const completedCount = activities.filter((a) => a.status === "concluida").length
  const totalCount = activities.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h5 className="font-semibold text-slate-900">📋 Lista de Atividades</h5>
          {totalCount > 0 && (
            <Badge variant="outline">
              {completedCount}/{totalCount} concluídas
            </Badge>
          )}
        </div>
        <Button size="sm" onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Atividade
        </Button>
      </div>

      {/* Formulário de Adicionar/Editar */}
      {(showAddForm || editingId) && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-200">
          <h6 className="font-medium text-slate-900">{editingId ? "Editar Atividade" : "Nova Atividade"}</h6>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Descrição da Atividade *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva a atividade a ser realizada..."
                rows={2}
              />
            </div>

            <div>
              <Label>Responsável *</Label>
              <Input
                value={formData.responsible}
                onChange={(e) => setFormData((prev) => ({ ...prev, responsible: e.target.value }))}
                placeholder="Nome do responsável..."
              />
            </div>

            <div>
              <Label>Data Limite</Label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div>
              <Label>Prioridade</Label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as Activity["priority"] }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={editingId ? handleSaveEdit : handleAdd}
              disabled={!formData.description.trim() || !formData.responsible.trim()}
            >
              {editingId ? "Salvar Alterações" : "Adicionar Atividade"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddForm(false)
                setEditingId(null)
                setFormData({
                  description: "",
                  responsible: "",
                  due_date: "",
                  priority: "media",
                  notes: "",
                })
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista de Atividades */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma atividade adicionada ainda.</p>
          <p className="text-sm">Clique em "Adicionar Atividade" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={cn(
                "bg-white border rounded-lg p-4 space-y-3",
                activity.status === "concluida" && "opacity-75 bg-green-50",
                activity.status === "cancelada" && "opacity-75 bg-red-50",
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={activity.status === "concluida"}
                      onCheckedChange={(checked) => handleStatusChange(activity.id, checked ? "concluida" : "pendente")}
                    />
                    <p className={cn("font-medium", activity.status === "concluida" && "line-through text-slate-500")}>
                      {activity.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {activity.responsible}
                    </div>
                    {activity.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(activity.due_date).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={priorityConfig[activity.priority].color}>
                      {priorityConfig[activity.priority].label}
                    </Badge>
                    <Badge className={statusConfig[activity.status].color}>{statusConfig[activity.status].label}</Badge>
                  </div>

                  {activity.notes && <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{activity.notes}</p>}
                </div>

                <div className="flex gap-1 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
