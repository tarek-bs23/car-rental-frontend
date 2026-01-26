const storageCache = new Map<string, string | null>()

function getLocalStorage(key: string): string | null {
  if (!storageCache.has(key)) {
    try {
      const value = localStorage.getItem(key)
      storageCache.set(key, value)
      return value
    } catch {
      return null
    }
  }
  return storageCache.get(key) ?? null
}

function setLocalStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
    storageCache.set(key, value)
  } catch {
    // Storage quota exceeded or disabled
  }
}

function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
    storageCache.delete(key)
  } catch {
    // Storage disabled
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key) storageCache.delete(e.key)
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      storageCache.clear()
    }
  })
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

export function getAccessToken(): string | null {
  return getLocalStorage('accessToken')
}

export function clearAuthStorage() {
  removeLocalStorage('accessToken')
  removeLocalStorage('user')
}

interface ApiJsonOptions {
  path: string
  method?: string
  body?: unknown
  skipAuth?: boolean
  token?: string
}

export async function apiJson<TResponse>(options: ApiJsonOptions): Promise<TResponse> {
  const { path, method = 'GET', body, skipAuth = false, token } = options

  const baseUrl = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${normalizedPath}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (!skipAuth) {
    const authToken = token || getAccessToken()
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
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
      if (typeof window !== 'undefined' && window.location.pathname !== '/launch') {
        window.location.href = '/launch'
      }
      throw new Error('Unauthorized')
    }

    const message =
      (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string'
        ? parsed.message
        : null) || 'Request failed'

    throw new Error(message)
  }

  return parsed as TResponse
}

