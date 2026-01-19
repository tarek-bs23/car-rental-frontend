export function getApiBaseUrl() {
  return 'http://localhost:3000'
}

interface ApiJsonOptions {
  path: string
  method?: string
  body?: unknown
}

export async function apiJson<TResponse>(options: ApiJsonOptions): Promise<TResponse> {
  const { path, method = 'GET', body } = options

  const baseUrl = getApiBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${normalizedPath}`

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  const parsed = isJson ? await response.json() : null

  if (!response.ok) {
    const message =
      (parsed && typeof parsed === 'object' && 'message' in parsed && typeof parsed.message === 'string'
        ? parsed.message
        : null) || 'Request failed'

    throw new Error(message)
  }

  return parsed as TResponse
}

