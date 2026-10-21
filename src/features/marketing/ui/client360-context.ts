import { createContext, useContext } from 'react'

export interface Client360Target {
  clientId: string
  /** Nombre ya conocido, para mostrarlo mientras carga la ficha. */
  name?: string | null
}

export interface Client360ContextValue {
  openClient360: (target: Client360Target) => void
}

export const Client360Context = createContext<Client360ContextValue | null>(null)

/** Abre la ficha 360° del cliente; null si no hay un Client360Provider arriba. */
export function useClient360(): Client360ContextValue | null {
  return useContext(Client360Context)
}
