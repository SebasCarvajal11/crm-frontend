import { useTourStore } from '../model/tour-store'
import { useTourContext } from './use-tour-context'
import type { CimaTourDefinition, GuidedQuestion } from '../model/types'

/** Commands only: the single mounted TourRuntime owns all browser effects. */
export function useTourRunner() {
  const ctx = useTourContext()
  const start = useTourStore((state) => state.start)
  const stopTour = useTourStore((state) => state.stop)
  return {
    startTour: (tour: CimaTourDefinition) => start(tour, ctx.role),
    highlightQuestion: (question: GuidedQuestion) => start({
      id: `question:${question.id}`, tab: question.id.startsWith('global-') ? ctx.activeTab : question.tab,
      title: question.question, description: question.answer, roles: question.roles,
      steps: [{ element: question.targetElement ?? '', fallbackElement: question.fallbackTargetElement,
        title: question.question, description: question.answer,
        scope: question.scope === 'all' ? undefined : question.scope,
        switchWorkspaceTab: question.workspaceTab, switchMarketingTab: question.marketingTab,
        sidebar: question.targetElement?.includes('sidebar-') ?? false,
      }],
    }, ctx.role),
    stopTour,
  }
}
