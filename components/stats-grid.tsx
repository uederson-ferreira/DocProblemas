import type { Problem } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

interface StatsGridProps {
  problems: Problem[]
}

export function StatsGrid({ problems }: StatsGridProps) {
  const stats = {
    total: problems.length,
    critico: problems.filter((p) => p.severity === "critico").length,
    alto: problems.filter((p) => p.severity === "alto").length,
    medio: problems.filter((p) => p.severity === "medio").length,
    baixo: problems.filter((p) => p.severity === "baixo").length,
    resolved: problems.filter((p) => p.status === "resolvido").length,
    unresolved: problems.filter((p) => p.status === "pendente").length,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-600">Total</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.critico}</div>
          <div className="text-sm text-slate-600">Críticos</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.alto}</div>
          <div className="text-sm text-slate-600">Altos</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.medio}</div>
          <div className="text-sm text-slate-600">Médios</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.baixo}</div>
          <div className="text-sm text-slate-600">Baixos</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{stats.resolved}</div>
          <div className="text-sm text-slate-600">Resolvidos</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{stats.unresolved}</div>
          <div className="text-sm text-slate-600">Pendentes</div>
        </CardContent>
      </Card>
    </div>
  )
}
