"use client"

import { useState } from "react"
import { ProblemCard } from "./problem-card"
import type { Problem, W5H2Plan } from "@/lib/supabase/client"

interface ProblemsListProps {
  problems: (Problem & { w5h2_plans: W5H2Plan[] })[]
}

export function ProblemsList({ problems }: ProblemsListProps) {
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProblems = problems.filter((problem) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && problem.status === "pendente") ||
      (filter === "resolved" && problem.status === "resolvido") ||
      problem.type === filter ||
      problem.severity === filter

    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  if (problems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum problema registrado</h3>
        <p className="text-gray-600">Comece adicionando o primeiro problema da obra.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredProblems.map((problem) => (
        <ProblemCard key={problem.id} problem={problem} plan={problem.w5h2_plans[0]} />
      ))}

      {filteredProblems.length === 0 && problems.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum problema encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}
