import { appRoutes } from '../routes/appRoutes'
import { clearAuthFlow } from './authFlowStorage'
import { clearAuthSession, getAuthSession, type AuthSession } from './authSessionStorage'
import { clearEmployeeSessionContext } from './employeeSessionContextStorage'

export function requireAuthSession() {
  const session = getAuthSession()

  if (!session) {
    redirectToAuth()
    throw new Error('Сессия не найдена. Выполните вход заново.')
  }

  return session
}

export function handleUnauthorizedResponse() {
  redirectToAuth()
}

export function redirectToAuth() {
  const session = getAuthSession()
  const nextPath = resolveAuthPath(session)

  clearAuthSession()
  clearAuthFlow()
  clearEmployeeSessionContext()

  if (window.location.pathname !== nextPath) {
    window.history.replaceState({}, '', nextPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
}

function resolveAuthPath(session: AuthSession | null) {
  if (session?.principalType === 'EMPLOYEE') {
    return appRoutes.employeeAuth
  }

  if (session?.principalType === 'STUDENT') {
    return appRoutes.studentAuth
  }

  return window.location.pathname.startsWith('/employee')
    ? appRoutes.employeeAuth
    : appRoutes.studentAuth
}
