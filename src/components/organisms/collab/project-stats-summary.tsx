type Props = {
  total: number
  active: number
  reviewing: number
  done: number
}

const STATS: { label: string; color: string; dot: string }[] = [
  { label: 'Total',       color: 'text-foreground',  dot: 'bg-foreground/30' },
  { label: 'En Curso',    color: 'text-blue-600',    dot: 'bg-blue-500' },
  { label: 'En Revision', color: 'text-amber-600',   dot: 'bg-amber-500' },
  { label: 'Completados', color: 'text-emerald-600', dot: 'bg-emerald-500' },
]

/**
 * Componente hoja: grid de estadisticas resumen de proyectos.
 * Renderiza 4 tarjetas con totales por estado.
 */
export function ProjectStatsSummary({ total, active, reviewing, done }: Props) {
  const values = [total, active, reviewing, done]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="region" aria-label="Resumen de proyectos">
      {STATS.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <span className={`size-2.5 rounded-full shrink-0 ${s.dot}`} aria-hidden="true" />
          <div className="min-w-0">
            <p className={`text-xl font-bold leading-none ${s.color}`}>{values[i]}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
