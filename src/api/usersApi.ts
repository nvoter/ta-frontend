import {
  getAuthorizationHeaders,
  getEmployeeGatewayUrl,
  getStudentGatewayUrl,
} from './gatewayApi'
import { requestJson } from './httpClient'

export interface StudentDto {
  birthDate: string | null
  citizenship: string
  course: string | null
  educationLevel: string | null
  educationalProgram: string | null
  email: string
  faculty: string | null
  firstName: string | null
  id: string
  isDocumentsUploaded?: boolean
  isProfileCompleted: boolean
  lastName: string | null
  middleName: string | null
  phone: string | null
  telegram: string | null
}

export interface EmployeeProfileDto {
  email: string
  fullName: string | null
  id: string
  isProfileCompleted: boolean
  isStatusNotificationEmailEnabled: boolean
  phone: string | null
  position: string | null
  role: string
  workplace: string | null
}

export interface EmployeeActingContext {
  actingAsFullName: string | null
}

export interface UpdateEmployeeSessionContextRequest {
  applicantEmail: string | null
  applicantName: string | null
  applicantPhone: string | null
  applicantPosition: string | null
  applicantWorkplace: string | null
  isTheApplicant: boolean
}

export interface EmployeeSessionContextDto {
  applicantEmail: string | null
  applicantName: string | null
  applicantPhone: string | null
  applicantPosition: string | null
  applicantWorkplace: string | null
  employeeSessionId: string
  id: string
  isTheApplicant: boolean
  updatedAt: string
}

export async function getCurrentStudent() {
  return requestJson<StudentDto>({
    baseUrl: getStudentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'students/me',
  })
}

export async function getCurrentEmployeeProfile() {
  return requestJson<EmployeeProfileDto>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'employees/me',
  })
}

export async function getStudentByEmail(email: string) {
  return requestJson<StudentDto>({
    baseUrl: getStudentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'students/by-email',
    query: { email },
  })
}

export async function updateCurrentStudentProfile(request: {
  birthDate: string
  citizenship: string
  course: string
  educationLevel: string
  educationalProgram: string
  faculty: string
  firstName: string
  lastName: string
  middleName: string | null
  phone: string
  telegram: string
}) {
  return requestJson<StudentDto>({
    baseUrl: getStudentGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: 'students/me/profile',
  })
}

export async function updateCurrentEmployeeProfile(request: {
  fullName: string
  isStatusNotificationEmailEnabled?: boolean | null
  phone: string
  position: string
  workplace: string
}) {
  return requestJson<EmployeeProfileDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: 'employees/me/profile',
  })
}

export async function getStudentByIdInternal(studentId: string) {
  return requestJson<StudentDto>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `students/${studentId}`,
  })
}

export async function getEmployeeActingContext() {
  const response = await getEmployeeSessionContext()

  return {
    actingAsFullName: response.isTheApplicant ? null : response.applicantName,
  } satisfies EmployeeActingContext
}

export async function getEmployeeSessionContext() {
  return requestJson<EmployeeSessionContextDto>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'employees/session-context',
  })
}

export async function updateEmployeeSessionContext(
  request: UpdateEmployeeSessionContextRequest,
) {
  return requestJson<EmployeeSessionContextDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: 'employees/session-context',
  })
}
