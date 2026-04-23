const EMPLOYEE_SESSION_CONTEXT_STORAGE_KEY = 'ta-employee-session-context'

interface StoredEmployeeSessionContext {
  actingAsFullName: string | null
}

export function getEmployeeSessionContext() {
  const rawValue = sessionStorage.getItem(EMPLOYEE_SESSION_CONTEXT_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as StoredEmployeeSessionContext
  } catch {
    return null
  }
}

export function saveEmployeeSessionContext(
  context: StoredEmployeeSessionContext,
) {
  sessionStorage.setItem(
    EMPLOYEE_SESSION_CONTEXT_STORAGE_KEY,
    JSON.stringify(context),
  )
}

export function clearEmployeeSessionContext() {
  sessionStorage.removeItem(EMPLOYEE_SESSION_CONTEXT_STORAGE_KEY)
}
