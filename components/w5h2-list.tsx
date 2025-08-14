"use client"

import { useState } from "react"
import type { W5H2Plan } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Save, X } from "lucide-react"
import { updateW5H2Plan, deleteW5H2Plan } from "@/lib/actions"

interface W5H2ListProps {
  plans: W5H2Plan[]
  onUpdate: (plans: W5H2Plan[]) => void
}

export function W5H2List({ plans, onUpdate }: W5H2ListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<W5H2Plan>>({})

  const handleEdit = (plan: W5H2Plan) => {
    setEditingId(plan.id)
    setEditData(plan)
  }

  const handleSave = async () => {
    if (!editingId || !editData) return

    const result = await updateW5H2Plan(editingId, editData)
    if (!result?.error) {
      const updatedPlans = plans.map((p) =>
        p.id === editingId ? { ...p, ...editData, updated_at: new Date().toISOString() } : p,
      )
      onUpdate(updatedPlans)
      setEditingId(null)
      setEditData({})
    }
  }

  const handleDelete = async (planId: string) => {
    if (confirm("Tem certeza que deseja deletar este plano 5W2H?")) {
      const result = await deleteW5H2Plan(planId)
      if (!result?.error) {
        const updatedPlans = plans.filter((p) => p.id !== planId)
        onUpdate(updatedPlans)
      }
    }
  }

  const handleResolvedChange = async (planId: string, resolved: boolean) => {
    const result = await updateW5H2Plan(planId, { resolved })
    if (!result?.error) {
      const updatedPlans = plans.map((p) =>
        p.id === planId ? { ...p, resolved, updated_at: new Date().toISOString() } : p,
      )
      onUpdate(updatedPlans)
    }
  }

  const handleObservationsChange = async (planId: string, observations: string) => {
    const result = await updateW5H2Plan(planId, { observations })
    if (!result?.error) {
      const updatedPlans = plans.map((p) =>
        p.id === planId ? { ...p, observations, updated_at: new Date().toISOString() } : p,
      )
      onUpdate(updatedPlans)
    }
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-4 text-slate-500">
        Nenhum plano 5W2H criado ainda. Preencha o formulário acima e clique em "Salvar Plano 5W2H" para adicionar.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-900">📋 Lista de Planos 5W2H</h4>

      {plans.map((plan, index) => (
        <Card key={plan.id} className={`${plan.resolved ? "bg-green-50 border-green-200" : "bg-white"}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">Plano #{index + 1}</span>
                {plan.resolved && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">✓ Resolvido</span>
                )}
                <span className="text-xs text-slate-500">{new Date(plan.created_at).toLocaleDateString("pt-BR")}</span>
              </div>

              <div className="flex gap-1">
                {editingId === plan.id ? (
                  <>
                    <Button size="sm" variant="outline" onClick={handleSave}>
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {editingId === plan.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs">O QUE</Label>
                  <Textarea
                    value={editData.what || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, what: e.target.value }))}
                    className="h-16 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">POR QUE</Label>
                  <Textarea
                    value={editData.why || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, why: e.target.value }))}
                    className="h-16 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">QUANDO</Label>
                  <Input
                    value={editData.when_plan || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, when_plan: e.target.value }))}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">ONDE</Label>
                  <Input
                    value={editData.where_plan || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, where_plan: e.target.value }))}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">QUEM</Label>
                  <Input
                    value={editData.who || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, who: e.target.value }))}
                    className="text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">COMO</Label>
                  <Textarea
                    value={editData.how || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, how: e.target.value }))}
                    className="h-16 text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">QUANTO</Label>
                  <Input
                    value={editData.how_much || ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, how_much: e.target.value }))}
                    className="text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-slate-600">O QUE:</span>
                  <p className="text-slate-800 mt-1">{plan.what}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">POR QUE:</span>
                  <p className="text-slate-800 mt-1">{plan.why}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">QUANDO:</span>
                  <p className="text-slate-800 mt-1">{plan.when_plan}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">ONDE:</span>
                  <p className="text-slate-800 mt-1">{plan.where_plan}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">QUEM:</span>
                  <p className="text-slate-800 mt-1">{plan.who}</p>
                </div>
                <div>
                  <span className="font-medium text-slate-600">COMO:</span>
                  <p className="text-slate-800 mt-1">{plan.how}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="font-medium text-slate-600">QUANTO:</span>
                  <p className="text-slate-800 mt-1">{plan.how_much}</p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={plan.resolved || false}
                  onCheckedChange={(checked) => handleResolvedChange(plan.id, !!checked)}
                />
                <Label className="text-sm">Marcar como resolvido</Label>
              </div>

              <div>
                <Label className="text-sm font-medium">Observações sobre a resolução:</Label>
                <Textarea
                  value={plan.observations || ""}
                  onChange={(e) => handleObservationsChange(plan.id, e.target.value)}
                  placeholder="Como foi resolvido, dificuldades encontradas, resultados..."
                  className="mt-1 text-sm"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
