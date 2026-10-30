import type { User } from '@/types'

type AuthResponse = {
  user?: User | null
  success?: boolean
  error?: string
  warning?: string
}

async function request<T extends AuthResponse>(
  method: 'GET' | 'POST',
  body?: Record<string, string>,
): Promise<T> {
  const response = await fetch('/api/auth', {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  let result: T
  try {
    result = await response.json() as T
  } catch {
    throw new Error(
      response.status === 404
        ? 'La fonction Vercel /api/auth est introuvable. Redéployez la dernière version du projet.'
        : 'Réponse invalide du serveur d’authentification. Vérifiez le déploiement Vercel.',
    )
  }
  if (!response.ok) {
    throw new Error(result.error ?? 'Le service d’authentification est indisponible.')
  }
  return result
}

export function getSession() {
  return request<{ user: User | null; redirectTo?: string }>('GET')
}

export async function completeBrowserCallback(): Promise<User | null> {
  const fragment = window.location.hash
  if (!fragment) return null

  const params = new URLSearchParams(fragment.slice(1))
  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  const type = params.get('type')
  const expiresIn = Number(params.get('expires_in'))
  if (!accessToken || !refreshToken || (type !== 'signup' && type !== 'recovery')) {
    return null
  }

  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)

  try {
    const result = await request<{ user: User }>('POST', {
      action: 'complete-callback',
      accessToken,
      refreshToken,
      expiresIn: String(Number.isFinite(expiresIn) ? expiresIn : 3600),
      type,
    })
    const destination = type === 'recovery' ? '/reset-password' : '/dashboard'
    window.history.replaceState({}, document.title, destination)
    return result.user
  } catch {
    const destination = type === 'recovery'
      ? '/forgot-password?authError=recovery'
      : '/login?authError=confirmation'
    window.history.replaceState({}, document.title, destination)
    return null
  }
}

export function authenticate(email: string, password: string) {
  return request<{ user: User }>('POST', { action: 'login', email, password })
}

export function registerAccount(
  email: string,
  password: string,
  fullName: string,
  companyName: string,
) {
  return request<{ success: boolean }>('POST', {
    action: 'register',
    email,
    password,
    fullName,
    companyName,
  })
}

export function sendPasswordRecovery(email: string) {
  return request<{ success: boolean }>('POST', { action: 'request-reset', email })
}

export function changePassword(password: string) {
  return request<{ success: boolean }>('POST', { action: 'update-password', password })
}

export function endSession() {
  return request<{ success: boolean; warning?: string }>('POST', { action: 'logout' })
}
