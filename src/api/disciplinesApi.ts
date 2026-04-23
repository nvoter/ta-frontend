import {
  getAuthorizationHeaders,
  getCurrentGatewayUrl,
} from './gatewayApi'
import { requestJson } from './httpClient'

export interface EducationalProgramDto {
  educationLevel: string
  id: string
  name: string
  shortName: string
}

export interface DisciplineDto {
  assignment: string | null
  course: string
  educationalProgramId: string
  groupsCount: number
  id: string
  maxAssistantsCount: number
  modules: number[]
  name: string
}

interface GetEducationalProgramsResponse {
  count: number
  programs: EducationalProgramDto[]
}

interface GetDisciplinesResponse {
  count: number
  disciplines: DisciplineDto[]
}

export async function getEducationalPrograms() {
  const response = await requestJson<GetEducationalProgramsResponse>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'programs',
  })

  return response.programs
}

export async function getEducationalProgramById(programId: string) {
  return requestJson<EducationalProgramDto>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `programs/${programId}`,
  })
}

export async function getDisciplinesByProgramId(programId: string) {
  const response = await requestJson<GetDisciplinesResponse>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `programs/${programId}/disciplines`,
  })

  return response.disciplines
}

export async function getDisciplineById(disciplineId: string) {
  return requestJson<DisciplineDto>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `disciplines/${disciplineId}`,
  })
}

export async function updateDisciplineAssignment(disciplineId: string, assignment: string) {
  return requestJson<DisciplineDto>({
    baseUrl: getCurrentGatewayUrl(),
    body: JSON.stringify({ assignment }),
    headers: {
      'Content-Type': 'application/json',
      ...getAuthorizationHeaders(),
    },
    method: 'PATCH',
    path: `disciplines/${disciplineId}`,
  })
}
