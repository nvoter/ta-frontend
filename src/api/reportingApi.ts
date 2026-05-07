import { parseApiError } from '../utils/apiError'
import { handleUnauthorizedResponse } from '../utils/authRedirect'
import {
  getAuthorizationHeaders,
  getEmployeeGatewayUrl,
} from './gatewayApi'
import { requestJson } from './httpClient'

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>

export interface ApplicationsSummaryRowDto {
  agreedApplicationsCount: number
  approvedApplicationsCount: number
  course: string
  disciplineName: string
  educationLevel: string
  educationalProgram: string
  groupsCount: number
  maxTeachingAssistantsCount: number
  modules: number[]
  submittedApplicationsCount: number
}

interface GetApplicationsSummaryResponse {
  items: ApplicationsSummaryRowDto[]
  total: number
}

export interface PartialReportFilters {
  disciplineEducationLevel?: string[]
  disciplineEducationalProgram?: string[]
  disciplineName?: string[]
  status?: string[]
  studentEducationalProgram?: string[]
  studentFaculty?: string[]
  studentFullName?: string[]
  workType?: string[]
}

export interface FullReportFilters {
  assistantSupervisorFullName?: string[]
  disciplineEducationLevel?: string[]
  disciplineEducationalProgram?: string[]
  disciplineName?: string[]
  status?: string[]
  studentEducationalProgram?: string[]
  studentFaculty?: string[]
  studentFullName?: string[]
  workType?: string[]
}

export async function getApplicationsSummary() {
  return requestJson<GetApplicationsSummaryResponse>({
    baseUrl: getEmployeeGatewayUrl(),
    headers: getAuthorizationHeaders(),
    path: 'reporting/applications/summary',
  })
}

export async function downloadPartialApplicationsReport(filters: PartialReportFilters) {
  return downloadReport(
    'reporting/applications/partial-report',
    'partial-applications-report.xlsx',
    filters,
  )
}

export async function downloadFullApplicationsReport(filters: FullReportFilters) {
  return downloadReport(
    'reporting/applications/full-report',
    'full-applications-report.xlsx',
    filters,
  )
}

async function downloadReport(
  path: string,
  fallbackFileName: string,
  query?: PartialReportFilters | FullReportFilters,
) {
  const response = await fetch(buildUrl(getEmployeeGatewayUrl(), path, query), {
    headers: getAuthorizationHeaders(),
  })

  if (response.status === 401) {
    handleUnauthorizedResponse()
  }

  if (!response.ok) {
    throw await parseApiError(response)
  }

  const blob = await response.blob()
  const fileName = extractFileName(response.headers.get('content-disposition')) || fallbackFileName
  downloadBlob(fileName, blob)
}

function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function extractFileName(contentDisposition: string | null) {
  if (!contentDisposition) {
    return null
  }

  const encodedMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)

  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1])
    } catch {
      return encodedMatch[1]
    }
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/)
  return match?.[1] ?? null
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: PartialReportFilters | FullReportFilters,
) {
  const url = new URL(path, ensureAbsoluteBaseUrl(ensureTrailingSlash(baseUrl)))

  if (query) {
    for (const [key, value] of Object.entries(query as Record<string, QueryValue>)) {
      if (value === null || value === undefined || value === '') {
        continue
      }

      if (Array.isArray(value)) {
        value
          .filter((item) => item !== null && item !== undefined && String(item) !== '')
          .forEach((item) => {
            url.searchParams.append(key, String(item))
          })
        continue
      }

      url.searchParams.set(key, String(value))
    }
  }

  return url.toString()
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}

function ensureAbsoluteBaseUrl(value: string) {
  if (/^https?:\/\//.test(value)) {
    return value
  }

  return new URL(value, window.location.origin).toString()
}
