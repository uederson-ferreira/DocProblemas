"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ProblemCard } from "@/components/problem-card"
import { AddProblemDialog } from "@/components/add-problem-dialog"
import { StatsGrid } from "@/components/stats-grid"
import { FilterControls } from "@/components/filter-controls"
import { Plus, Download, AlertTriangle, LogOut } from "lucide-react"
import type { Problem, W5H2Plan } from "@/lib/supabase/client"
import { signOut } from "@/lib/actions"

interface ProblemsAppProps {
  initialProblems: (Problem & { w5h2_plans: W5H2Plan[] })[]
  user: { email?: string }
}

export function ProblemsApp({ initialProblems, user }: ProblemsAppProps) {
  const [problems, setProblems] = useState(initialProblems || [])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filtrar problemas
  const filteredProblems = useMemo(() => {
    if (!Array.isArray(problems)) {
      return []
    }

    return problems.filter((problem) => {
      const matchesSearch =
        problem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (problem.location && problem.location.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesSeverity = severityFilter === "all" || problem.severity === severityFilter
      const matchesType = typeFilter === "all" || problem.type === typeFilter

      return matchesSearch && matchesSeverity && matchesType
    })
  }, [problems, searchTerm, severityFilter, typeFilter])

  const handleProblemAdded = (newProblem: Problem & { w5h2_plans: W5H2Plan[] }) => {
    setProblems((prev) => [newProblem, ...(prev || [])])
  }

  const handleProblemUpdated = (updatedProblem: Problem & { w5h2_plans: W5H2Plan[] }) => {
    setProblems((prev) => (prev || []).map((problem) => (problem.id === updatedProblem.id ? updatedProblem : problem)))
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(problems || [], null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `problemas-obra-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const unresolvedCount = (problems || []).filter((p) => p.status === "pendente").length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">📋 Sistema de Registro de Problemas</h1>
              <p className="text-slate-600 mt-1">Documentação de problemas de segurança e ambientais em obras</p>
              <p className="text-sm text-slate-500 mt-1">Usuário: {user.email}</p>
            </div>

            <div className="flex items-center gap-4">
              {unresolvedCount > 0 && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">{unresolvedCount} problema(s) não resolvido(s)</span>
                </div>
              )}

              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Problema
            </Button>

            <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </div>

          <div className="flex-1">
            <FilterControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
            />
          </div>
        </div>

        {/* Estatísticas */}
        <StatsGrid problems={problems || []} />

        {/* Lista de Problemas */}
        <div className="space-y-6">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {(problems || []).length === 0 ? "Nenhum problema registrado" : "Nenhum problema encontrado"}
              </h3>
              <p className="text-slate-600 mb-6">
                {(problems || []).length === 0
                  ? 'Clique em "Novo Problema" para começar a documentar'
                  : "Tente ajustar os filtros de busca"}
              </p>
              {(problems || []).length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>Registrar Primeiro Problema</Button>
              )}
            </div>
          ) : (
            filteredProblems.map((problem, index) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                plan={problem.w5h2_plans[0]}
                index={index}
                onUpdate={handleProblemUpdated}
              />
            ))
          )}
        </div>
      </main>

      {/* Dialog para adicionar problema */}
      <AddProblemDialog open={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleProblemAdded} />
    </div>
  )
}
