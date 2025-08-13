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
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Buscar problemas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={severityFilter} onValueChange={onSeverityChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Todas as severidades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as severidades</SelectItem>
          <SelectItem value="critico">Crítico</SelectItem>
          <SelectItem value="alto">Alto</SelectItem>
          <SelectItem value="medio">Médio</SelectItem>
          <SelectItem value="baixo">Baixo</SelectItem>
        </SelectContent>
      </Select>

      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Todos os tipos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="seguranca">Segurança</SelectItem>
          <SelectItem value="desmatamento">Desmatamento</SelectItem>
          <SelectItem value="poluicao">Poluição</SelectItem>
          <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
          <SelectItem value="licenciamento">Licenciamento</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
