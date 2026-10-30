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

  const result = await response.json().catch(() => ({})) as T
  if (!response.ok) {
    throw new Error(result.error ?? 'Le service d’authentification est indisponible.')
  }
  return result
}

export function getSession() {
  return request<{ user: User | null }>('GET')
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
