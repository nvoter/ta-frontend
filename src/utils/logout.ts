import { logout as logoutRequest } from '../api/authApi'
import { appRoutes } from '../routes/appRoutes'
import { clearAuthFlow } from './authFlowStorage'
import { getAuthSession } from './authSessionStorage'
import { clearEmployeeSessionContext } from './employeeSessionContextStorage'
import { navigateTo } from './navigation'

export async function logoutAndRedirect() {
  const principalType = getAuthSession()?.principalType

  await logoutRequest()
  clearAuthFlow()
  clearEmployeeSessionContext()

  navigateTo(
    principalType === 'EMPLOYEE'
      ? appRoutes.employeeAuth
      : appRoutes.studentAuth,
  )
}
