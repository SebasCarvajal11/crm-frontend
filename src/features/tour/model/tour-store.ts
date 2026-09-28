import { create } from 'zustand'
import type { CimaTourDefinition, TourUserRole } from './types'
import { canCompleteSession, createTourSession, moveSession, visitSession, type TourSession } from './tour-session'

export const completionStorageKey = (owner: string) => `cima_tour_v2:${encodeURIComponent(owner.toLocaleLowerCase('es'))}`

export function parseCompleted(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))] : []
  } catch { return [] }
}

function readCompleted(owner: string): string[] {
  try { return parseCompleted(window.localStorage.getItem(completionStorageKey(owner))) } catch { return [] }
}

function persist(owner: string | null, ids: string[]) {
  if (!owner) return
  try { window.localStorage.setItem(completionStorageKey(owner), JSON.stringify(ids)) } catch { /* Storage may be restricted. */ }
}

type TourStoreState = {
  isHelpCenterOpen: boolean
  completedTourIds: string[]
  initialSearchQuery?: string
  session: TourSession | null
  sequence: number
  historyOwner: string | null
  setHistoryOwner: (owner: string | null) => void
  openHelpCenter: () => void
  closeHelpCenter: () => void
  toggleHelpCenter: () => void
  focusHelpCenterWithQuery: (query?: string) => void
  start: (tour: CimaTourDefinition, role: TourUserRole) => void
  stop: () => void
  move: (index: number) => void
  retry: () => void
  visit: (revision: number) => void
  minimize: (minimized: boolean) => void
  finish: () => void
  resetAllTours: () => void
}

export const useTourStore = create<TourStoreState>((set, get) => ({
  isHelpCenterOpen: false, completedTourIds: [], initialSearchQuery: undefined,
  session: null, sequence: 0, historyOwner: null,
  setHistoryOwner: (owner) => {
    if (owner === get().historyOwner) return
    set({ historyOwner: owner, completedTourIds: owner ? readCompleted(owner) : [], session: null, isHelpCenterOpen: false })
  },
  openHelpCenter: () => set({ isHelpCenterOpen: true, initialSearchQuery: undefined }),
  closeHelpCenter: () => set({ isHelpCenterOpen: false, initialSearchQuery: undefined }),
  toggleHelpCenter: () => set((state) => ({ isHelpCenterOpen: !state.isHelpCenterOpen, initialSearchQuery: undefined })),
  focusHelpCenterWithQuery: (query = '') => set({ isHelpCenterOpen: true, initialSearchQuery: query }),
  start: (tour, role) => {
    const sequence = get().sequence + 1
    set({ session: createTourSession(tour, role, sequence), sequence, isHelpCenterOpen: false, initialSearchQuery: undefined })
  },
  stop: () => set((state) => ({ session: null, sequence: state.sequence + 1 })),
  move: (index) => set((state) => {
    if (!state.session) return state
    const session = moveSession(state.session, index)
    return { session, sequence: Math.max(state.sequence, session.revision) }
  }),
  retry: () => set((state) => state.session
    ? { session: { ...state.session, revision: state.sequence + 1 }, sequence: state.sequence + 1 }
    : state),
  visit: (revision) => set((state) => state.session ? { session: visitSession(state.session, revision) } : state),
  minimize: (minimized) => set((state) => state.session ? { session: { ...state.session, minimized } } : state),
  finish: () => {
    const { session, completedTourIds } = get()
    if (!session) return
    const ids = canCompleteSession(session) && !session.tour.id.startsWith('question:')
      ? [...new Set([...completedTourIds, session.tour.id])] : completedTourIds
    persist(get().historyOwner, ids)
    set({ completedTourIds: ids, session: null })
  },
  resetAllTours: () => { persist(get().historyOwner, []); set({ completedTourIds: [], session: null }) },
}))
