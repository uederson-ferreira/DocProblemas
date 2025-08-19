"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface FilterControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  severityFilter: string
  onSeverityChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
}

export function FilterControls({
  searchTerm,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  typeFilter,
  onTypeChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Busca - sempre no topo para mobile */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="🔍 Buscar problemas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 text-base" // text-base melhora em mobile
        />
      </div>

      {/* Filtros em linha para mobile, lado a lado em telas maiores */}
      <div className="flex flex-col xs:flex-row gap-3 xs:gap-2">
        <Select value={severityFilter} onValueChange={onSeverityChange}>
          <SelectTrigger className="w-full xs:flex-1 sm:w-40 lg:w-48">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as severidades</SelectItem>
            <SelectItem value="critico">🔴 Crítico</SelectItem>
            <SelectItem value="alto">🟠 Alto</SelectItem>
            <SelectItem value="medio">🟡 Médio</SelectItem>
            <SelectItem value="baixo">🟢 Baixo</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full xs:flex-1 sm:w-40 lg:w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="meio_ambiente">🌱 Meio Ambiente</SelectItem>
            <SelectItem value="saude">💊 Saúde</SelectItem>
            <SelectItem value="seguranca">🛡️ Segurança</SelectItem>
            <SelectItem value="outros">📋 Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
