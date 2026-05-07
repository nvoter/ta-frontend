import { ApiError, parseApiError } from '../utils/apiError'
import { handleUnauthorizedResponse } from '../utils/authRedirect'
import {
  getAuthorizationHeaders,
  getCurrentGatewayUrl,
  getEmployeeGatewayUrl,
  getStudentGatewayUrl,
} from './gatewayApi'
import { requestJson, requestVoid } from './httpClient'

export type ApplicationStatus =
  | 'NEW'
  | 'INTERESTED'
  | 'AGREED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DELETED'

export type WorkType = 'FREE' | 'PAID'

export interface ApprovedModuleDto {
  module: number
  positionsCount: number
}

export interface ApplicationDisciplineDto {
  approvedModules: ApprovedModuleDto[]
  disciplineId: string
  id: string
  lecturerName: string
  lecturerAssistant: boolean
  motivation: string
  priority: number
  seminarianName: string
  status: ApplicationStatus
  studiedDisciplineGrade: number
  studiedDisciplineName: string
  twoGroups: boolean
  updatedAt: string
  updatedByEmployeeId: string | null
  updatedByEmployeeSessionContextId: string | null
  workType: WorkType
}

export interface GradebookDto {
  contentType: string
  downloadUrl: string
  fileName: string
  viewUrl: string
}

export interface ApplicationDto {
  campaignId: string
  campaignEndsAt: string
  campaignStartsAt: string
  createdAt: string
  disciplines: ApplicationDisciplineDto[]
  gradebook: GradebookDto
  id: string
  socialPension: boolean
  studentId: string
}

export interface ApplicationDisciplineOverviewDto {
  applicationDisciplineId: string
  applicationId: string
  approvedModules: ApprovedModuleDto[]
  campaignId: string
  createdAt: string
  disciplineId: string
  lecturerName: string
  priority: number
  seminarianName: string
  status: ApplicationStatus
  studentId: string
  twoGroups: boolean
  workType: WorkType
}

export interface ApplicationInfoDto {
  campaignId: string
  createdAt: string
  gradebook: GradebookDto
  id: string
  studentId: string
}

export interface CampaignDto {
  endsAt: string
  foreignCitizenDocumentFormUrl: string | null
  id: string
  isActive: boolean
  russianCitizenDocumentFormUrl: string | null
  startsAt: string
}

export interface RelatedApplicationDisciplineDto {
  applicationDisciplineId: string
  applicationId: string
  disciplineId: string
  priority: number
  status: ApplicationStatus
}

export interface StudentWorkloadDto {
  disciplinePerModule: ApprovedModuleDto[]
  totalFreeApprovedPositionsCount: number
  totalPaidApprovedPositionsCount: number
  perModule: ApprovedModuleDto[]
  totalApprovedPositionsCount: number
}

export interface ApplicationDisciplineDetailsResponse {
  application: ApplicationInfoDto
  applicationDiscipline: ApplicationDisciplineDto
  relatedDisciplines: {
    approvedPastCampaigns: RelatedApplicationDisciplineDto[]
    currentCampaign: RelatedApplicationDisciplineDto[]
    totalCount: number
  }
  workload: StudentWorkloadDto | null
}

type RawApplicationDto = Omit<ApplicationDto, 'campaignEndsAt' | 'campaignStartsAt'> & {
  campaign?: {
    endsAt?: string | null
    startsAt?: string | null
  } | null
  campaignEndAt?: string | null
  campaignEndsAt?: string | null
  campaignStartAt?: string | null
  campaignStartsAt?: string | null
}

interface RawGetApplicationsResponse {
  applications: RawApplicationDto[]
  count: number
  workload: StudentWorkloadDto | null
}

export interface GetMyApplicationsResponse {
  applications: ApplicationDto[]
  workload: StudentWorkloadDto | null
}

interface CampaignsResponse {
  campaigns: CampaignDto[]
}

export interface GetApplicationDisciplinesOverviewResponse {
  page: number
  size: number
  totalElements: number
  totalPages: number
  disciplines: ApplicationDisciplineOverviewDto[]
}

interface GetApplicationDisciplinesOverviewInput {
  page?: number
  size?: number
}

export interface GetApplicationDisciplinesResponse {
  disciplines: ApplicationDisciplineDto[]
}

interface CreateApplicationInput {
  disciplines: Array<{
    disciplineId: string
    lecturerName: string
    motivation: string
    priority: number
    seminarianName: string
    studiedDisciplineGrade: number
    studiedDisciplineName: string
    twoGroups: boolean
    workType: WorkType
  }>
  gradebook: File
  socialPension: boolean
}

interface UpdateApplicationInput {
  applicationId: string
  disciplines: Array<{
    applicationDisciplineId?: string
    disciplineId: string
    lecturerName: string
    motivation: string
    priority: number
    seminarianName: string
    studiedDisciplineGrade: number
    studiedDisciplineName: string
    twoGroups: boolean
    workType: WorkType
  }>
  gradebook?: File | null
}

export async function getMyApplications(): Promise<GetMyApplicationsResponse> {
  const response = await requestJson<RawGetApplicationsResponse>({
    baseUrl: getStudentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'applications',
  })

  return {
    applications: response.applications.map((application) => ({
      ...normalizeApplicationCampaignDates(application),
      gradebook: normalizeGradebookUrls(application.gradebook, getStudentGatewayUrl()),
    })),
    workload: response.workload,
  }
}

export async function createApplication(input: CreateApplicationInput) {
  const formData = new FormData()

  formData.set(
    'data',
    new Blob(
      [
        JSON.stringify({
          disciplines: input.disciplines,
          socialPension: input.socialPension,
        }),
      ],
      { type: 'application/json' },
    ),
  )
  formData.set('gradebook', input.gradebook)

  const response = await requestJson<RawApplicationDto>({
    baseUrl: getStudentGatewayUrl(),
    body: formData,
    headers: getAuthorizationHeaders(),
    method: 'POST',
    path: 'applications',
  })

  return {
    ...normalizeApplicationCampaignDates(response),
    gradebook: normalizeGradebookUrls(response.gradebook, getStudentGatewayUrl()),
  }
}

export async function getApplicationById(applicationId: string) {
  const baseUrl = getCurrentGatewayUrl()
  const response = await requestJson<RawApplicationDto>({
    baseUrl,
    headers: getAuthorizationHeaders(),
    path: `applications/${applicationId}`,
  })

  return {
    ...normalizeApplicationCampaignDates(response),
    gradebook: normalizeGradebookUrls(response.gradebook, baseUrl),
  }
}

export async function getApplicationDisciplinesOverview(
  input: GetApplicationDisciplinesOverviewInput = {},
) {
  const response = await getApplicationDisciplinesOverviewPage(input)

  return response.disciplines
}

export async function getApplicationDisciplinesOverviewPage(
  input: GetApplicationDisciplinesOverviewInput = {},
) {
  const searchParams = new URLSearchParams()

  if (typeof input.page === 'number') {
    searchParams.set('page', String(input.page))
  }

  if (typeof input.size === 'number') {
    searchParams.set('size', String(input.size))
  }

  const response = await requestJson<GetApplicationDisciplinesOverviewResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `application-disciplines${searchParams.size > 0 ? `?${searchParams}` : ''}`,
  })

  return response
}

export async function getMyApplicationDisciplinesOverview(
  input: GetApplicationDisciplinesOverviewInput = {},
) {
  const response = await getMyApplicationDisciplinesOverviewPage(input)

  return response.disciplines
}

export async function getMyApplicationDisciplinesOverviewPage(
  input: GetApplicationDisciplinesOverviewInput = {},
) {
  const searchParams = new URLSearchParams()

  if (typeof input.page === 'number') {
    searchParams.set('page', String(input.page))
  }

  if (typeof input.size === 'number') {
    searchParams.set('size', String(input.size))
  }

  const response = await requestJson<GetApplicationDisciplinesOverviewResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `application-disciplines/my${searchParams.size > 0 ? `?${searchParams}` : ''}`,
  })

  return response
}

export async function getCurrentCampaign() {
  try {
    return await requestJson<CampaignDto>({
      baseUrl: getCurrentGatewayUrl(),
      headers: getAuthorizationHeaders(),
      path: 'campaigns/current',
    })
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function getAvailableCampaigns() {
  const response = await requestJson<CampaignsResponse>({
    baseUrl: getCurrentGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'campaigns',
  })

  return response.campaigns
}

export async function getApplicationDisciplineDetails(applicationDisciplineId: string) {
  const response = await requestJson<ApplicationDisciplineDetailsResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: `application-disciplines/${applicationDisciplineId}`,
  })

  return {
    ...response,
    application: {
      ...response.application,
      gradebook: normalizeGradebookUrls(
        response.application.gradebook,
        getEmployeeGatewayUrl(),
      ),
    },
  }
}

export async function updateApplication(input: UpdateApplicationInput) {
  const formData = new FormData()

  formData.set(
    'data',
    new Blob(
      [
        JSON.stringify({
          disciplines: input.disciplines.map((discipline) => ({
            applicationDisciplineId: discipline.applicationDisciplineId,
            disciplineId: discipline.disciplineId,
            lecturerName: discipline.lecturerName,
            motivation: discipline.motivation,
            priority: discipline.priority,
            seminarianName: discipline.seminarianName,
            studiedDisciplineGrade: discipline.studiedDisciplineGrade,
            studiedDisciplineName: discipline.studiedDisciplineName,
            twoGroups: discipline.twoGroups,
            workType: discipline.workType,
          })),
        }),
      ],
      { type: 'application/json' },
    ),
  )

  if (input.gradebook) {
    formData.set('gradebook', input.gradebook)
  }

  const response = await requestJson<RawApplicationDto>({
    baseUrl: getStudentGatewayUrl(),
    body: formData,
    headers: getAuthorizationHeaders(),
    method: 'PATCH',
    path: `applications/${input.applicationId}`,
  })

  return {
    ...normalizeApplicationCampaignDates(response),
    gradebook: normalizeGradebookUrls(response.gradebook, getStudentGatewayUrl()),
  }
}

export async function updateApplicationDisciplinesPriorities(input: {
  applicationId: string
  disciplines: Array<{
    id: string
    priority: number
  }>
}) {
  await requestVoid({
    baseUrl: getStudentGatewayUrl(),
    body: JSON.stringify({
      disciplines: input.disciplines.map((discipline) => ({
        id: discipline.id,
        priority: discipline.priority,
      })),
    }),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PUT',
    path: `applications/${input.applicationId}/disciplines/priorities`,
  })

  const application = await getApplicationById(input.applicationId)

  return {
    disciplines: application.disciplines,
  }
}

export async function updateApplicationDisciplineStatus(input: {
  applicationDisciplineId: string
  applicationId: string
  approvedModules: ApprovedModuleDto[]
  lecturerAssistant: boolean
  status: ApplicationStatus
}) {
  return requestJson<ApplicationDisciplineDto>({
    baseUrl: getEmployeeGatewayUrl(),
    body: JSON.stringify({
      approvedModules: input.approvedModules,
      lecturerAssistant: input.lecturerAssistant,
      status: input.status,
    }),
    headers: {
      ...getAuthorizationHeaders(),
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
    path: `applications/${input.applicationId}/disciplines/${input.applicationDisciplineId}/status`,
  })
}

export async function openGradebookDocument(input: {
  fileName: string
  url: string
}) {
  const blob = await fetchGradebookBlob(input.url)
  const objectUrl = URL.createObjectURL(blob)

  window.open(objectUrl, '_blank', 'noopener,noreferrer')

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 60_000)
}

export async function downloadGradebookDocument(input: {
  fileName: string
  url: string
}) {
  const blob = await fetchGradebookBlob(input.url)
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = input.fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

async function fetchGradebookBlob(url: string) {
  const response = await fetch(url, {
    headers: getAuthorizationHeaders(),
  })

  if (response.status === 401) {
    handleUnauthorizedResponse()
  }

  if (!response.ok) {
    throw await parseApiError(response)
  }

  return response.blob()
}

function normalizeApplicationCampaignDates(application: RawApplicationDto): ApplicationDto {
  return {
    ...application,
    campaignEndsAt:
      application.campaignEndsAt ??
      application.campaignEndAt ??
      application.campaign?.endsAt ??
      '',
    campaignStartsAt:
      application.campaignStartsAt ??
      application.campaignStartAt ??
      application.campaign?.startsAt ??
      '',
  }
}

function normalizeGradebookUrls(gradebook: GradebookDto, baseUrl: string) {
  return {
    ...gradebook,
    downloadUrl: normalizeApplicationsAssetUrl(gradebook.downloadUrl, baseUrl),
    viewUrl: normalizeApplicationsAssetUrl(gradebook.viewUrl, baseUrl),
  }
}

function normalizeApplicationsAssetUrl(path: string, baseUrl: string) {
  if (/^https?:\/\//.test(baseUrl)) {
    return new URL(path, `${baseUrl}/`).toString()
  }

  const proxyPrefix = getProxyPrefix(baseUrl)
  const normalizedPath = path.startsWith('/')
    ? `${proxyPrefix}${path}`
    : `${proxyPrefix}/${path}`

  return new URL(normalizedPath, window.location.origin).toString()
}

function getProxyPrefix(value: string) {
  const [firstSegment = ''] = value.split('/').filter(Boolean)
  return firstSegment ? `/${firstSegment}` : ''
}
