const AUTH_SESSION_STORAGE_KEY = 'ta-auth-session'

export type PrincipalType = 'STUDENT' | 'EMPLOYEE'
export type UserRole = 'STUDENT' | 'TEACHER' | 'MANAGER' | 'ADMIN'
export type EmployeeRole = 'TEACHER' | 'MANAGER' | 'ADMIN'

export interface AuthSession {
  accessToken: string
  email: string
  employeeFullName?: string
  principalType: PrincipalType
  refreshToken: string
  requiresProfileCompletion: boolean
  userId: string
  userRole: UserRole
}

export function getAuthSession() {
  const rawValue = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthSession
  } catch {
    return null
  }
}

export function saveAuthSession(session: AuthSession) {
  sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function updateAuthSessionAccessToken(accessToken: string) {
  const session = getAuthSession()

  if (!session) {
    return
  }

  saveAuthSession({
    ...session,
    accessToken,
  })
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}
