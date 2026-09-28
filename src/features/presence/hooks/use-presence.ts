import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { isHTTPError } from 'ky'
import { listPresence } from '../api/presence-api'
import type { PresencePages } from '../model/presence'
import { useBrowserAvailability } from './use-browser-availability'

export function usePresence(owner: string, search: string, pages: PresencePages) {
  const available = useBrowserAvailability()
  const [clock, setClock] = useState(Date.now)
  const query = useQuery({
    queryKey: ['admin-presence', owner, search, pages],
    queryFn: ({ signal }) => listPresence(search, pages, signal),
    enabled: available,
    placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === owner && previousQuery.queryKey[2] === search ? previous : undefined,
    gcTime: 0, staleTime: 20_000, retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: (current) => {
      if (isHTTPError(current.state.error) && [401, 403].includes(current.state.error.response.status)) return false
      return current.state.error ? 60_000 : (current.state.data?.refresh_after_seconds ?? 30) * 1000
    },
  })
  useEffect(() => {
    if (!available) return
    const timer = setInterval(() => setClock(Date.now()), 15_000)
    return () => clearInterval(timer)
  }, [available])
  const revoked = isHTTPError(query.error) && [401, 403].includes(query.error.response.status)
  const data = revoked ? undefined : query.data
  const elapsed = Math.max(0, clock - (data?.receivedAt ?? clock))
  return { ...query, data, available, revoked,
    now: data ? Date.parse(data.as_of) + elapsed : clock,
    stale: !available || query.isError || !!data && elapsed > data.refresh_after_seconds * 2000,
  }
}
