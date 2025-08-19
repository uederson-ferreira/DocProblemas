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
import { PrintReport } from "@/components/print-report"
import { ExportPPTX } from "@/components/export-pptx"
import { ExportExcel } from "@/components/export-excel"

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

  const handleProblemDeleted = (problemId: string) => {
    setProblems((prev) => (prev || []).filter((problem) => problem.id !== problemId))
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
      {/* Header - Mobile First */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Título e Usuário */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
                  📋 Sistema de Registro de Problemas
                </h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1 hidden sm:block">
                  Documentação de problemas de segurança e ambientais em obras
                </p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Usuário: {user.email}
                </p>
              </div>

              {/* Botão Sair - Sempre visível no mobile */}
              <form action={signOut} className="flex-shrink-0">
                <Button type="submit" variant="outline" size="sm" className="w-full sm:w-auto">
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </form>
            </div>

            {/* Alerta de problemas não resolvidos */}
            {unresolvedCount > 0 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-200 text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">
                  {unresolvedCount} problema{unresolvedCount > 1 ? 's' : ''} não resolvido{unresolvedCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Controles - Mobile First */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          {/* Linha 1: Filtros e Busca (prioridade mobile) */}
          <div className="w-full">
            <FilterControls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
            />
          </div>

          {/* Linha 2: Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            {/* Botão principal sempre em destaque */}
            <Button 
              onClick={() => setShowAddDialog(true)} 
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-1"
            >
              <Plus className="w-4 h-4" />
              Novo Problema
            </Button>

            {/* Botões secundários em linha no mobile */}
            <div className="flex gap-2 order-2 sm:order-2">
              <Button 
                variant="outline" 
                onClick={handleExportData} 
                className="flex items-center justify-center gap-2 flex-1 sm:flex-initial bg-transparent"
                size="sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden xs:inline">JSON</span>
              </Button>

              <div className="flex-1 sm:flex-initial">
                <ExportExcel problems={problems || []} />
              </div>

              <div className="flex-1 sm:flex-initial">
                <PrintReport problems={problems || []} />
              </div>

              <div className="flex-1 sm:flex-initial">
                <ExportPPTX problems={problems || []} />
              </div>
            </div>
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
                onDelete={handleProblemDeleted}
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
