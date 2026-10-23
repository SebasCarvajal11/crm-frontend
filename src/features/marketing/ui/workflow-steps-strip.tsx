import { ArrowRight } from 'lucide-react'

const STEPS = [
  { title: 'Audiencia', text: 'La campaña dice a quién le llega: un cliente, un segmento o todos.' },
  { title: 'Disparador', text: 'Cuándo actúa: fecha programada, sin contacto, propuesta sin respuesta, proyecto finalizado o manual.' },
  { title: 'Acción', text: 'Qué hace: correo, mensaje al portal, WhatsApp por enviar, seguimiento o alerta.' },
  { title: 'Ver a quién le llegaría', text: 'Revise quién lo recibe hoy y por qué los demás no.' },
  { title: 'Ejecutar ahora', text: 'Si no quiere esperar al planificador, ejecútela y vea el resultado por cliente.' },
] as const

/** Cómo funciona una automatización, en el orden en que se configura. */
export function WorkflowStepsStrip() {
  return (
    <ol
      className="grid gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-2xs sm:grid-cols-2 lg:grid-cols-5"
      aria-label="Cómo funciona una automatización"
      data-tour="marketing-workflows-steps"
    >
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex gap-2 rounded-lg bg-muted/30 p-2.5">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold">{s.title}</p>
            <p className="text-[11px] leading-snug text-muted-foreground">{s.text}</p>
          </div>
          {i < STEPS.length - 1 && (
            <ArrowRight
              className="absolute -right-2.5 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground/60 lg:block"
              aria-hidden="true"
            />
          )}
        </li>
      ))}
    </ol>
  )
}
