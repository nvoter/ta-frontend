import type { EmployeeRole, PrincipalType } from './authSessionStorage'

const AUTH_FLOW_STORAGE_KEY = 'ta-auth-flow'

interface AuthFlowData {
  email: string
  employeeRequest?: {
    email: string
    password: string
    role: EmployeeRole
  }
  previousPath: string
  principalType: PrincipalType
}

export function saveAuthFlow(data: AuthFlowData) {
  sessionStorage.setItem(AUTH_FLOW_STORAGE_KEY, JSON.stringify(data))
}

export function getAuthFlow() {
  const rawValue = sessionStorage.getItem(AUTH_FLOW_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as AuthFlowData
  } catch {
    return null
  }
}

export function clearAuthFlow() {
  sessionStorage.removeItem(AUTH_FLOW_STORAGE_KEY)
}
