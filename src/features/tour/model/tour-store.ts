import { create } from 'zustand'
import type { CimaTourDefinition, TourUserRole } from './types'
import { canCompleteSession, createTourSession, moveSession, visitSession, type TourSession } from './tour-session'

export const completionStorageKey = (owner: string) => `cima_tour_v2:${encodeURIComponent(owner.toLocaleLowerCase('es'))}`
export const welcomeStorageKey = (owner: string) => `cima_welcome_v2:${encodeURIComponent(owner.toLocaleLowerCase('es'))}`

export function parseCompleted(raw: string | null): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]')
    return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))] : []
  } catch { return [] }
}

export function parseSeenWelcome(raw: string | null): boolean {
  return raw === 'true'
}

const memoryStorageFallback = new Map<string, string>()

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage
    if (typeof localStorage !== 'undefined') return localStorage
  } catch { /* Storage access may be restricted */ }
  return {
    getItem: (key: string) => memoryStorageFallback.get(key) ?? null,
    setItem: (key: string, val: string) => { memoryStorageFallback.set(key, val) },
    removeItem: (key: string) => { memoryStorageFallback.delete(key) },
  }
}

function readCompleted(owner: string): string[] {
  try { return parseCompleted(getStorage()?.getItem(completionStorageKey(owner)) ?? null) } catch { return [] }
}

function readSeenWelcome(owner: string): boolean {
  try { return parseSeenWelcome(getStorage()?.getItem(welcomeStorageKey(owner)) ?? null) } catch { return false }
}

function persist(owner: string | null, ids: string[]) {
  if (!owner) return
  try { getStorage()?.setItem(completionStorageKey(owner), JSON.stringify(ids)) } catch { /* Storage may be restricted. */ }
}

export const feedbackStorageKey = (owner: string) => `cima_feedback_v2:${encodeURIComponent(owner.toLocaleLowerCase('es'))}`

export type QuestionFeedbackMap = Record<string, 'helpful' | 'unhelpful'>

export function parseFeedback(raw: string | null): QuestionFeedbackMap {
  try {
    const value: unknown = JSON.parse(raw ?? '{}')
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? (value as QuestionFeedbackMap)
      : {}
  } catch { return {} }
}

function persistSeenWelcome(owner: string | null, seen: boolean) {
  if (!owner) return
  try { getStorage()?.setItem(welcomeStorageKey(owner), seen ? 'true' : 'false') } catch { /* Storage may be restricted. */ }
}

function readFeedback(owner: string): QuestionFeedbackMap {
  try { return parseFeedback(getStorage()?.getItem(feedbackStorageKey(owner)) ?? null) } catch { return {} }
}

function persistFeedback(owner: string | null, feedback: QuestionFeedbackMap) {
  if (!owner) return
  try { getStorage()?.setItem(feedbackStorageKey(owner), JSON.stringify(feedback)) } catch { /* Storage may be restricted. */ }
}




type TourStoreState = {
  isHelpCenterOpen: boolean
  isWelcomeOpen: boolean
  hasSeenWelcome: boolean
  completedTourIds: string[]
  feedbackByQuestionId: QuestionFeedbackMap
  initialSearchQuery?: string
  session: TourSession | null
  sequence: number
  historyOwner: string | null
  setHistoryOwner: (owner: string | null) => void
  openHelpCenter: () => void
  closeHelpCenter: () => void
  toggleHelpCenter: () => void
  openWelcome: () => void
  closeWelcome: () => void
  dismissWelcome: () => void
  setFeedback: (questionId: string, value: 'helpful' | 'unhelpful') => void
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
  isHelpCenterOpen: false, isWelcomeOpen: false, hasSeenWelcome: false,
  completedTourIds: [], feedbackByQuestionId: {}, initialSearchQuery: undefined,
  session: null, sequence: 0, historyOwner: null,
  setHistoryOwner: (owner) => {
    if (owner === get().historyOwner) return
    const seen = owner ? readSeenWelcome(owner) : false
    set({
      historyOwner: owner,
      completedTourIds: owner ? readCompleted(owner) : [],
      feedbackByQuestionId: owner ? readFeedback(owner) : {},
      hasSeenWelcome: seen,
      isWelcomeOpen: false,
      session: null,
      isHelpCenterOpen: false,
    })
  },
  openHelpCenter: () => set({ isHelpCenterOpen: true, isWelcomeOpen: false, initialSearchQuery: undefined }),
  closeHelpCenter: () => set({ isHelpCenterOpen: false, initialSearchQuery: undefined }),
  toggleHelpCenter: () => set((state) => ({
    isHelpCenterOpen: !state.isHelpCenterOpen,
    isWelcomeOpen: false,
    initialSearchQuery: undefined,
  })),
  openWelcome: () => set({ isWelcomeOpen: true, isHelpCenterOpen: false }),
  closeWelcome: () => set({ isWelcomeOpen: false }),
  dismissWelcome: () => {
    persistSeenWelcome(get().historyOwner, true)
    set({ isWelcomeOpen: false, hasSeenWelcome: true })
  },
  setFeedback: (questionId, value) => {
    const feedbackByQuestionId = { ...get().feedbackByQuestionId, [questionId]: value }
    persistFeedback(get().historyOwner, feedbackByQuestionId)
    set({ feedbackByQuestionId })
  },
  focusHelpCenterWithQuery: (query = '') => set({ isHelpCenterOpen: true, isWelcomeOpen: false, initialSearchQuery: query }),
  start: (tour, role) => {
    const sequence = get().sequence + 1
    set({
      session: createTourSession(tour, role, sequence),
      sequence,
      isHelpCenterOpen: false,
      isWelcomeOpen: false,
      initialSearchQuery: undefined,
    })
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
  resetAllTours: () => {
    persist(get().historyOwner, [])
    persistSeenWelcome(get().historyOwner, false)
    persistFeedback(get().historyOwner, {})
    set({ completedTourIds: [], feedbackByQuestionId: {}, hasSeenWelcome: false, isWelcomeOpen: false, session: null })
  },
}))
