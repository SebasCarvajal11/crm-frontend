import { useState } from 'react'
import { FileText, Shield, Cloud, Scale } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
    <div className="flex border-b border-border/80 pb-px gap-1 sm:gap-2">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-md transition-all border-b-2 -mb-px cursor-pointer ${
              isActive
                ? 'border-primary text-primary bg-primary/5 shadow-xs'
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
    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 text-xs text-muted-foreground leading-relaxed">
      {sections.map((sec) => (
        <div key={sec.id} className="space-y-1 rounded-lg border border-border/40 bg-muted/10 p-3">
          <h4 className="font-bold text-foreground text-xs">{sec.title}</h4>
          {sec.content.map((p, idx) => (
            <p key={idx}>{p}</p>
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Scale className="size-5" />
            <DialogTitle className="text-base font-bold">Marco Normativo y Legal CIMA CRM</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Versión oficial {TERMS_VERSION} • Actualizado a {TERMS_LAST_UPDATED}
          </DialogDescription>
        </DialogHeader>

        <TabNavigation activeTab={activeTab} onSelect={setActiveTab} />
        <SectionList sections={activeSections} />

        <div className="flex justify-end pt-2">
          <Button type="button" variant="default" size="sm" onClick={() => onOpenChange(false)}>
            Entendido y cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
