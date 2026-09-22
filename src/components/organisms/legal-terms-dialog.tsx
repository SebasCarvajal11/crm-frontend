import { useState } from 'react'
import { FileText, Shield, Cloud, Scale } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/20">
              <Scale className="size-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-bold text-foreground">Marco Normativo y Legal CIMA CRM</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Versión oficial {TERMS_VERSION} • Actualizado a {TERMS_LAST_UPDATED}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 sm:px-6 space-y-4">
          <TabNavigation activeTab={activeTab} onSelect={setActiveTab} />
          <SectionList sections={activeSections} />
        </div>

        <DialogFooter className="flex justify-end">
          <Button type="button" variant="default" size="default" onClick={() => onOpenChange(false)} className="w-full sm:w-auto text-xs">
            Entendido y cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
