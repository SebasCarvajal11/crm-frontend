import { useState } from 'react'
import { FileText, Shield, Cloud, Scale } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogMedia,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  TERMS_AND_CONDITIONS,
  PRIVACY_POLICY,
  CLOUD_SECURITY_POLICY,
  TERMS_LAST_UPDATED,
  TERMS_VERSION,
  type LegalSection,
} from '@/features/auth/model'

export type LegalTab = 'terms' | 'privacy' | 'security'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: LegalTab
}

const TABS: { id: LegalTab; label: string; icon: typeof Scale }[] = [
  { id: 'terms', label: 'Términos de Uso', icon: FileText },
  { id: 'privacy', label: 'Tratamiento de Datos (Ley 1581)', icon: Shield },
  { id: 'security', label: 'Seguridad en la Nube', icon: Cloud },
]

function TabNavigation({
  activeTab,
  onSelect,
}: {
  activeTab: LegalTab
  onSelect: (tab: LegalTab) => void
}) {
  return (
    <div className="flex border-b border-border/70 pb-px gap-1 sm:gap-2">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all border-b-2 -mb-px cursor-pointer rounded-t-lg ${
              isActive
                ? 'border-primary text-primary bg-primary/5 shadow-2xs'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            }`}
          >
            <Icon className="size-3.5" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function SectionList({ sections }: { sections: readonly LegalSection[] }) {
  return (
    <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1 text-xs text-muted-foreground leading-relaxed scrollbar-thin">
      {sections.map((sec) => (
        <div key={sec.id} className="space-y-1.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 shadow-2xs">
          <h4 className="font-bold text-foreground text-xs">{sec.title}</h4>
          {sec.content.map((p, idx) => (
            <p key={idx} className="leading-relaxed">{p}</p>
          ))}
        </div>
      ))}
    </div>
  )
}

export function LegalTermsDialog({ open, onOpenChange, initialTab = 'terms' }: Props) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab)
  const [prevInitialTab, setPrevInitialTab] = useState<LegalTab>(initialTab)

  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab)
    setActiveTab(initialTab)
  }

  const activeSections =
    activeTab === 'terms'
      ? TERMS_AND_CONDITIONS
      : activeTab === 'privacy'
        ? PRIVACY_POLICY
        : CLOUD_SECURITY_POLICY

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogMedia variant="default">
              <Scale className="size-5" />
            </DialogMedia>
            <div className="space-y-0.5">
              <DialogTitle>Marco Normativo y Legal CIMA CRM</DialogTitle>
              <DialogDescription>
                Versión oficial {TERMS_VERSION} • Actualizado a {TERMS_LAST_UPDATED}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <TabNavigation activeTab={activeTab} onSelect={setActiveTab} />
          <SectionList sections={activeSections} />
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs font-semibold shadow-2xs"
          >
            Entendido y cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
