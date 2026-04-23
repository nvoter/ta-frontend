import type {
  AuthSession,
  EmployeeRole,
  PrincipalType,
} from '../utils/authSessionStorage'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../utils/authSessionStorage'
import { getGatewayUrlForPrincipalType } from './gatewayApi'
import { requestJson, requestVoid } from './httpClient'

interface VerifyConfirmationCodeResponse {
  accessToken: string
  principalType: PrincipalType
  refreshToken: string
  requiresProfileCompletion: boolean
  userId: string
  userRole: AuthSession['userRole']
}

interface EmployeeConfirmationRequestInput {
  email: string
  password: string
  role: EmployeeRole
}

interface AuthFlowContext {
  email: string
  employeeRequest?: EmployeeConfirmationRequestInput
  principalType: PrincipalType
}

export async function requestStudentConfirmationCode(email: string) {
  await requestVoid({
    baseUrl: getGatewayUrlForPrincipalType('STUDENT'),
    body: JSON.stringify({ email }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: 'auth/students/confirmation-code',
  })
}

export async function requestEmployeeConfirmationCode(
  request: EmployeeConfirmationRequestInput,
) {
  await requestVoid({
    baseUrl: getGatewayUrlForPrincipalType('EMPLOYEE'),
    body: JSON.stringify({
      email: request.email,
      password: request.password,
      role: request.role,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: 'auth/employees/confirmation-code',
  })
}

export async function resendConfirmationCode(authFlow: AuthFlowContext) {
  if (authFlow.principalType === 'STUDENT') {
    await requestStudentConfirmationCode(authFlow.email)
    return
  }

  if (!authFlow.employeeRequest) {
    throw new Error('Отсутствуют данные сотрудника для повторной отправки кода')
  }

  await requestEmployeeConfirmationCode(authFlow.employeeRequest)
}

export async function confirmAuthCode(code: string, authFlow: AuthFlowContext) {
  const response = await requestJson<VerifyConfirmationCodeResponse>({
    baseUrl: getGatewayUrlForPrincipalType(authFlow.principalType),
    body: JSON.stringify({
      code,
      email: authFlow.email,
      principalType: authFlow.principalType,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: 'auth/confirmations/verify',
  })

  saveAuthSession({
    accessToken: response.accessToken,
    email: authFlow.email,
    principalType: response.principalType,
    refreshToken: response.refreshToken,
    requiresProfileCompletion: response.requiresProfileCompletion,
    userId: response.userId,
    userRole: response.userRole,
  })

  return response
}

export async function logout() {
  const session = getAuthSession()

  if (!session?.refreshToken) {
    clearAuthSession()
    return
  }

  try {
    await requestVoid({
      baseUrl: getGatewayUrlForPrincipalType(session.principalType),
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      path: 'auth/logout',
    })
  } finally {
    clearAuthSession()
  }
}
