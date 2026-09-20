import { Label } from '@/components/ui/label'

interface TriEstadoProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}

const OPCIONES: { label: string; valor: boolean | null }[] = [
  { label: 'Indiferente', valor: null },
  { label: 'Sí', valor: true },
  { label: 'No', valor: false },
]

export function TriEstado({ label, value, onChange }: TriEstadoProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1 rounded-md border border-input p-1">
        {OPCIONES.map((op) => (
          <button
            key={String(op.valor)}
            type="button"
            onClick={() => onChange(op.valor)}
            className={`flex-1 rounded px-2 py-1 text-xs transition-colors ${
              value === op.valor
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>
    </div>
  )
}
