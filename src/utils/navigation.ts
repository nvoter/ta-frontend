export function navigateTo(path: string, state?: Record<string, unknown>) {
  window.history.pushState(state ?? {}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
