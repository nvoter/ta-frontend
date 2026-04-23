import { apiConfig } from '../config/apiConfig'
import { requireAuthSession } from '../utils/authRedirect'
import {
  getAuthSession,
  type PrincipalType,
} from '../utils/authSessionStorage'

export function getGatewayUrlForPrincipalType(principalType: PrincipalType) {
  return principalType === 'EMPLOYEE'
    ? apiConfig.employeeGatewayUrl
    : apiConfig.studentGatewayUrl
}

export function getCurrentGatewayUrl() {
  const session = requireAuthSession()
  return getGatewayUrlForPrincipalType(session.principalType)
}

export function getEmployeeGatewayUrl() {
  return apiConfig.employeeGatewayUrl
}

export function getStudentGatewayUrl() {
  return apiConfig.studentGatewayUrl
}

export function getAuthorizationHeaders() {
  const session = requireAuthSession()

  return {
    Authorization: `Bearer ${session.accessToken}`,
  }
}

export function getOptionalAuthorizationHeaders() {
  const session = getAuthSession()

  if (!session?.accessToken) {
    return {}
  }

  return {
    Authorization: `Bearer ${session.accessToken}`,
  }
}
