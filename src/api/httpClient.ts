import {
  clearAuthSession,
  getAuthSession,
  updateAuthSessionAccessToken,
} from '../utils/authSessionStorage'
import { handleUnauthorizedResponse } from '../utils/authRedirect'
import { parseApiError } from '../utils/apiError'
import { getGatewayUrlForPrincipalType } from './gatewayApi'

type QueryValue = string | number | boolean | null | undefined

interface RequestOptions {
  baseUrl: string
  body?: BodyInit | null
  headers?: HeadersInit
  method?: string
  path: string
  query?: Record<string, QueryValue>
}

export async function requestJson<T>({
  baseUrl,
  body,
  headers,
  method = 'GET',
  path,
  query,
}: RequestOptions): Promise<T> {
  const response = await executeRequest({ baseUrl, body, headers, method, path, query })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  return (await response.json()) as T
}

export async function requestVoid({
  baseUrl,
  body,
  headers,
  method = 'GET',
  path,
  query,
}: RequestOptions) {
  const response = await executeRequest({ baseUrl, body, headers, method, path, query })

  if (!response.ok) {
    throw await parseApiError(response)
  }
}

async function executeRequest({
  baseUrl,
  body,
  headers,
  method = 'GET',
  path,
  query,
}: RequestOptions) {
  try {
    const response = await fetch(buildUrl(baseUrl, path, query), {
      body,
      headers,
      method,
    })

    if (response.status !== 401) {
      return response
    }

    const hasRefreshed = await refreshAccessToken()

    if (!hasRefreshed) {
      handleUnauthorizedResponse()
      return response
    }

    const retriedResponse = await fetch(buildUrl(baseUrl, path, query), {
      body,
      headers: withRefreshedAuthorizationHeader(headers),
      method,
    })

    if (retriedResponse.status === 401) {
      handleUnauthorizedResponse()
    }

    return retriedResponse
  } catch {
    throw new Error('Не удалось подключиться к сервису')
  }
}

let refreshAccessTokenPromise: Promise<boolean> | null = null

async function refreshAccessToken() {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise
  }

  refreshAccessTokenPromise = performRefreshAccessToken()

  try {
    return await refreshAccessTokenPromise
  } finally {
    refreshAccessTokenPromise = null
  }
}

async function performRefreshAccessToken() {
  const session = getAuthSession()

  if (!session?.refreshToken) {
    return false
  }

  try {
    const response = await fetch(buildUrl(
      getGatewayUrlForPrincipalType(session.principalType),
      'auth/refresh',
    ), {
      body: JSON.stringify({
        refreshToken: session.refreshToken,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    if (!response.ok) {
      clearAuthSession()
      return false
    }

    const data = (await response.json()) as { accessToken?: string }

    if (!data.accessToken) {
      clearAuthSession()
      return false
    }

    updateAuthSessionAccessToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

function withRefreshedAuthorizationHeader(headers?: HeadersInit) {
  const session = getAuthSession()

  if (!session?.accessToken) {
    return headers
  }

  const normalizedHeaders = new Headers(headers)

  if (normalizedHeaders.has('Authorization')) {
    normalizedHeaders.set('Authorization', `Bearer ${session.accessToken}`)
  }

  return normalizedHeaders
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
) {
  const url = new URL(
    path,
    ensureAbsoluteBaseUrl(ensureTrailingSlash(baseUrl)),
  )

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') {
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
