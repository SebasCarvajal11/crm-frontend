import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Mail, MessageSquare, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TEMPLATE_VARIABLES } from './templates.utils'

const STORAGE_KEY = 'cima_marketing_templates_help_hidden'

function readHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function writeHidden(hidden: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(hidden))
  } catch {
    // Sin almacenamiento disponible: la preferencia dura solo esta visita.
  }
}

const USOS = [
  {
    icon: Zap,
    title: 'En Automatizaciones',
    text: 'Al crear un flujo de correo o WhatsApp, elija la plantilla y el sistema la envía sola a cada cliente.',
  },
  {
    icon: MessageSquare,
    title: 'En "Abrir en WhatsApp"',
    text: 'Desde Clientes o Interacciones, elija una plantilla de WhatsApp y el mensaje sale escrito con los datos del cliente.',
  },
  {
    icon: Bell,
    title: 'En la aplicación',
    text: 'Para avisos y seguimientos internos que registran las automatizaciones.',
  },
]

const PASOS = [
  'Pulse "Nueva plantilla", escriba el mensaje e inserte las variables que necesite.',
  'Elija el canal (Correo, WhatsApp o En la aplicación) y, si aplica, el plan de los clientes.',
  'Guárdela y use "Vista previa" para verla con los datos de un cliente real.',
  'Úsela en una automatización o al abrir WhatsApp.',
]

interface TemplatesExplainerProps {
  /** Si no hay plantillas, la explicación se muestra abierta aunque se haya ocultado antes. */
  forceOpen?: boolean
}

/** Explicación de qué es una plantilla y dónde se usa (pestaña Plantillas). */
export function TemplatesExplainer({ forceOpen = false }: TemplatesExplainerProps) {
  const [hidden, setHidden] = useState(readHidden)
  const open = forceOpen || !hidden

  function toggle() {
    const next = open
    setHidden(next)
    writeHidden(next)
  }

  return (
    <section
      aria-labelledby="templates-explainer-title"
      data-tour="marketing-templates-help"
      className="rounded-xl border border-primary/25 bg-primary/[0.03] p-4 shadow-2xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <HelpCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <h3 id="templates-explainer-title" className="text-sm font-bold">
              ¿Qué es una plantilla?
            </h3>
            <p className="text-sm text-muted-foreground">
              Es un mensaje que se escribe <strong className="font-semibold text-foreground">una sola vez</strong> y
              se reutiliza con muchos clientes. Las palabras entre llaves, como{' '}
              <code className="rounded bg-muted px-1 font-mono text-xs text-foreground">{'{nombre}'}</code>, se
              cambian solas por los datos de cada cliente al enviar.
            </p>
          </div>
        </div>
        {!forceOpen && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1 text-xs"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="templates-explainer-body"
          >
            {open ? (
              <>
                Ocultar <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                Ver explicación <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        )}
      </div>

      {open && (
        <div id="templates-explainer-body" className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ejemplo</p>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg border border-border/80 bg-card p-3">
                <p className="mb-1 text-[11px] font-semibold text-muted-foreground">Lo que usted escribe</p>
                <p>
                  Hola <code className="rounded bg-muted px-1 font-mono text-xs">{'{nombre}'}</code>, gracias por
                  confiar en el plan <code className="rounded bg-muted px-1 font-mono text-xs">{'{plan}'}</code>.
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
                <p className="mb-1 text-[11px] font-semibold text-muted-foreground">Lo que recibe el cliente Acme SAS</p>
                <p>Hola Acme SAS, gracias por confiar en el plan Oro.</p>
              </div>
            </div>

            <p className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Variables</p>
            <dl className="grid gap-1.5 text-xs">
              {TEMPLATE_VARIABLES.map((v) => (
                <div key={v.token} className="flex gap-2">
                  <dt>
                    <code className="rounded bg-muted px-1 font-mono">{v.token}</code>
                  </dt>
                  <dd className="text-muted-foreground">{v.description}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dónde se usa</p>
            <ul className="space-y-2">
              {USOS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-2.5 text-sm">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">{title}:</span>{' '}
                    <span className="text-muted-foreground">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Cómo crear una</p>
            <ol className="space-y-1.5 text-sm">
              {PASOS.map((paso, i) => (
                <li key={paso} className="flex gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{paso}</span>
                </li>
              ))}
            </ol>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              El asunto solo aplica a las plantillas de correo. Con plan "Todos", la plantilla sirve para cualquier
              cliente.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
