export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

export function clearAuthStorage() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}

interface ApiJsonOptions {
  path: string
  method?: string
  body?: unknown
  skipAuth?: boolean
}

export async function apiJson<TResponse>(options: ApiJsonOptions): Promise<TResponse> {
  const { path, method = 'GET', body, skipAuth = false } = options

  const baseUrl = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${normalizedPath}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  const parsed = isJson ? await response.json() : null

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthStorage()
      window.location.href = '/launch'
    }

    const message =
      (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string'
        ? parsed.message
        : null) || 'Request failed'

    throw new Error(message)
  }

  return parsed as TResponse
}

