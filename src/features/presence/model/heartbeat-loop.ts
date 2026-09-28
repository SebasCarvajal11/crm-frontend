/** One cancellable request at a time; failures back off without breaking the application. */
export function createHeartbeatLoop(send: (signal: AbortSignal) => Promise<number>, available: () => boolean) {
  const controller = new AbortController()
  let timer: ReturnType<typeof setTimeout>
  let inFlight = false
  let nextAt = 0
  let failures = 0
  const wake = () => {
    clearTimeout(timer)
    if (controller.signal.aborted || inFlight || !available()) return
    if (Date.now() < nextAt) { timer = setTimeout(wake, nextAt - Date.now()); return }
    inFlight = true
    void send(controller.signal).then((interval) => {
      failures = 0
      nextAt = Date.now() + interval
    }).catch(() => {
      failures++
      nextAt = Date.now() + Math.min(300_000, 60_000 * 2 ** Math.min(failures - 1, 3))
    }).finally(() => {
      inFlight = false
      if (!controller.signal.aborted && available()) timer = setTimeout(wake, Math.max(0, nextAt - Date.now()))
    })
  }
  timer = setTimeout(wake, 0)
  return { wake, stop: () => { controller.abort(); clearTimeout(timer) } }
}
