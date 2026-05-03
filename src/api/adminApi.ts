import {
  getAuthorizationHeaders,
  getEmployeeGatewayUrl,
} from './gatewayApi'
import { requestJson, requestVoid } from './httpClient'

export interface CampaignDto {
  endsAt: string
  foreignCitizenDocumentFormUrl: string | null
  id: string
  isActive: boolean
  russianCitizenDocumentFormUrl: string | null
  startsAt: string
}

interface CampaignsResponse {
  campaigns: CampaignDto[]
}

interface CreateCampaignRequest {
  endsAt: string
  foreignCitizenDocumentFormUrl: string | null
  russianCitizenDocumentFormUrl: string | null
  startsAt: string
}

interface UpdateCampaignRequest {
  endsAt?: string
  foreignCitizenDocumentFormUrl?: string | null
  isActive?: boolean
  russianCitizenDocumentFormUrl?: string | null
  startsAt?: string
}

export interface EmployeeDto {
  backupEmail: string | null
  createdAt: string
  email: string
  fullName: string
  id: string
  isActive: boolean
  isProfileCompleted: boolean
  phone: string
  position: string
  role: string
  updatedAt: string
  workplace: string
}

export interface AdminStudentDto {
  citizenship: string
  course: string | null
  educationLevel: string | null
  educationalProgram: string | null
  email: string
  faculty: string | null
  firstName: string | null
  id: string
  isDocumentsUploaded: boolean
  lastName: string | null
  middleName: string | null
}

interface CreateEmployeeRequest {
  backupEmail?: string | null
  corporateEmail: string
  fullName: string
}

interface StudentsImportResponse {
  createdCount: number
  skippedCount: number
  totalRows: number
  updatedCount: number
}

interface StudentDocumentsUploadStartDateResponse {
  startDate: string | null
}

interface StudentDocumentsUploadImportResponse {
  markedUploadedCount: number
  skippedCount: number
  totalRows: number
}

interface StudentCoursesPromotionResponse {
  graduatedCount: number
  promotedCount: number
  skippedCount: number
  totalStudents: number
}

export interface DisciplineImportDto {
  createdAt: string
  finishedAt: string | null
  id: string
  status: string
}

interface GetDisciplineImportsResponse {
  imports: DisciplineImportDto[]
}

export interface AdminDisciplineDto {
  assignment: string | null
  course: string
  educationalProgramId: string
  groupsCount: number
  id: string
  maxAssistantsCount: number
  modules: number[]
  name: string
}

interface GetDisciplinesResponse {
  disciplines: AdminDisciplineDto[]
}

interface CreateDisciplineRequest {
  course: string
  educationalProgramId: string
  groupsCount: number
  maxAssistantsCount: number
  modules: number[]
  name: string
}

interface UpdateDisciplineRequest {
  assignment?: string | null
  course?: string
  educationalProgramId?: string
  groupsCount?: number
  maxAssistantsCount?: number
  modules?: number[]
  name?: string
}

export async function getCampaigns() {
  const response = await requestJson<CampaignsResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'campaigns',
  })

  return response.campaigns
}

export async function createCampaign(request: CreateCampaignRequest) {
  return requestJson<CampaignDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: 'campaigns',
  })
}

export async function updateCampaign(campaignId: string, request: UpdateCampaignRequest) {
  return requestJson<CampaignDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
    path: `campaigns/${campaignId}`,
  })
}

export async function deleteCampaign(campaignId: string) {
  return requestVoid({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    method: 'DELETE',
    path: `campaigns/${campaignId}`,
  })
}

export async function getCurrentEmployee() {
  return requestJson<EmployeeDto>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'employees/me',
  })
}

export async function getAllEmployees() {
  return requestJson<EmployeeDto[]>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'employees',
  })
}

export async function createEmployee(request: CreateEmployeeRequest) {
  return requestJson<EmployeeDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: 'employees',
  })
}

export async function updateEmployeeBackupEmail(employeeId: string, backupEmail: string | null) {
  return requestJson<EmployeeDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify({ backupEmail }),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: `employees/${employeeId}/backup-email`,
  })
}

export async function importDisciplinesXlsx(file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return requestJson<DisciplineImportDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: formData,
    headers: getAuthorizationHeaders(),
    method: 'POST',
    path: 'import/xlsx',
  })
}

export async function getDisciplineImports() {
  const response = await requestJson<GetDisciplineImportsResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'imports',
  })

  return response.imports
}

export async function getDisciplines(name?: string) {
  const response = await requestJson<GetDisciplinesResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'disciplines',
    query: name ? { name } : undefined,
  })

  return response.disciplines
}

export async function createDiscipline(request: CreateDisciplineRequest) {
  return requestJson<AdminDisciplineDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    path: 'disciplines',
  })
}

export async function updateDiscipline(disciplineId: string, request: UpdateDisciplineRequest) {
  return requestJson<AdminDisciplineDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify(request),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: `disciplines/${disciplineId}`,
  })
}

export async function deleteDiscipline(disciplineId: string) {
  return requestVoid({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    method: 'DELETE',
    path: `disciplines/${disciplineId}`,
  })
}

export async function importStudentsXlsx(file: File) {
  const formData = new FormData()
  formData.set('file', file)

  return requestJson<StudentsImportResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    body: formData,
    headers: getAuthorizationHeaders(),
    method: 'POST',
    path: 'students/import/xlsx',
  })
}

export async function getAllStudents() {
  return requestJson<AdminStudentDto[]>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'students',
  })
}

export async function setStudentsDocumentsUploadStartDate(startDate: string) {
  return requestJson<StudentDocumentsUploadStartDateResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify({ startDate }),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: 'students/documents-upload/start-date',
  })
}

export async function getStudentsDocumentsUploadStartDate() {
  return requestJson<StudentDocumentsUploadStartDateResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'students/documents-upload/start-date',
  })
}

export async function importStudentsDocumentsXlsx(files: File[]) {
  const formData = new FormData()

  for (const file of files) {
    formData.append('files', file)
  }

  return requestJson<StudentDocumentsUploadImportResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    body: formData,
    headers: getAuthorizationHeaders(),
    method: 'POST',
    path: 'students/documents-upload/xlsx',
  })
}

export async function promoteStudentsCourses() {
  return requestJson<StudentCoursesPromotionResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    method: 'POST',
    path: 'students/courses/promote',
  })
}
