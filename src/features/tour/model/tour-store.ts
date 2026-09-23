import { create } from 'zustand'

const STORAGE_KEY_COMPLETED = 'cima_tour_completed_ids'
const STORAGE_KEY_FIRST_VISIT = 'cima_tour_first_visit_dismissed'

function readStoredCompleted(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_COMPLETED)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistCompleted(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(ids))
  } catch {
    // Silently continue if storage is restricted
  }
}

function readStoredFirstVisit(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY_FIRST_VISIT) === 'true'
  } catch {
    return false
  }
}

function persistFirstVisit(val: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY_FIRST_VISIT, String(val))
  } catch {
    // Silently continue
  }
}

export type TourStoreState = {
  isHelpCenterOpen: boolean
  activeTourId: string | null
  completedTourIds: string[]
  firstVisitDismissed: boolean
  isTourPaused: boolean
  pauseReason?: string
  openHelpCenter: () => void
  closeHelpCenter: () => void
  toggleHelpCenter: () => void
  setActiveTour: (tourId: string | null) => void
  markTourCompleted: (tourId: string) => void
  dismissFirstVisit: () => void
  resetAllTours: () => void
  isTourCompleted: (tourId: string) => boolean
  pauseTour: (reason?: string) => void
  resumeTour: () => void
}

export const useTourStore = create<TourStoreState>((set, get) => ({
  isHelpCenterOpen: false,
  activeTourId: null,
  completedTourIds: readStoredCompleted(),
  firstVisitDismissed: readStoredFirstVisit(),
  isTourPaused: false,
  pauseReason: undefined,

  openHelpCenter: () => set({ isHelpCenterOpen: true }),
  closeHelpCenter: () => set({ isHelpCenterOpen: false }),
  toggleHelpCenter: () => set((s) => ({ isHelpCenterOpen: !s.isHelpCenterOpen })),

  setActiveTour: (tourId) => set({ activeTourId: tourId, isTourPaused: false, pauseReason: undefined }),

  markTourCompleted: (tourId) => {
    const prev = get().completedTourIds
    if (prev.includes(tourId)) return
    const next = [...prev, tourId]
    persistCompleted(next)
    set({ completedTourIds: next, activeTourId: null, isTourPaused: false })
  },

  dismissFirstVisit: () => {
    persistFirstVisit(true)
    set({ firstVisitDismissed: true })
  },

  resetAllTours: () => {
    persistCompleted([])
    persistFirstVisit(false)
    set({ completedTourIds: [], firstVisitDismissed: false, activeTourId: null, isTourPaused: false })
  },

  isTourCompleted: (tourId) => get().completedTourIds.includes(tourId),

  pauseTour: (reason) => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('cima-tour-paused')
    }
    set({ isTourPaused: true, pauseReason: reason })
  },

  resumeTour: () => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('cima-tour-paused')
    }
    set({ isTourPaused: false, pauseReason: undefined })
  },
}))
