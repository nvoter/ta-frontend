interface ApiErrorPayload {
  code?: number
  details?: Record<string, string>
  error?: string
  message?: string
  status?: number
}

export class ApiError extends Error {
  details?: Record<string, string>
  status: number

  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export async function parseApiError(response: Response) {
  let payload: ApiErrorPayload | null = null

  try {
    payload = (await response.json()) as ApiErrorPayload
  } catch {
    payload = null
  }

  return new ApiError(
    response.status,
    payload?.message || payload?.error || 'Не удалось выполнить запрос',
    payload?.details,
  )
}
