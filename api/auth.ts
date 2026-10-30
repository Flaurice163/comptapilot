import type { VercelRequest, VercelResponse } from '@vercel/node'

type AuthUser = {
  id: string
  email?: string
  created_at?: string
  user_metadata?: Record<string, unknown>
}

type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  user: AuthUser
}

type AuthPayload = {
  id?: string
  email?: string
  created_at?: string
  user_metadata?: Record<string, unknown>
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user?: AuthUser
  message?: string
  msg?: string
  error?: string
  error_description?: string
  code?: string
}

type ApiBody = {
  action?: string
  email?: string
  password?: string
  fullName?: string
  companyName?: string
  accessToken?: string
  refreshToken?: string
  expiresIn?: string
  type?: string
}

const ACCESS_COOKIE = 'comptapilot_access'
const REFRESH_COOKIE = 'comptapilot_refresh'
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('Missing server-side Supabase configuration.')
  }
  if (!key.startsWith('sb_publishable_')) {
    throw new Error('SUPABASE_PUBLISHABLE_KEY must contain a publishable key.')
  }
  return { url: url.replace(/\/+$/, ''), key }
}

function appUrl(req: VercelRequest): URL {
  const configuredUrl = process.env.APP_URL
  if (configuredUrl) return new URL(configuredUrl)

  const deploymentHost = process.env.VERCEL_URL
  if (deploymentHost) return new URL(`https://${deploymentHost}`)

  const host = req.headers.host ?? 'localhost:3000'
  const forwardedProtocol = req.headers['x-forwarded-proto']
  const protocol = Array.isArray(forwardedProtocol)
    ? forwardedProtocol[0]
    : forwardedProtocol?.split(',')[0] ?? 'http'
  return new URL(`${protocol}://${host}`)
}

function setNoCache(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, private')
  res.setHeader('Pragma', 'no-cache')
}

function json(res: VercelResponse, status: number, body: object) {
  setNoCache(res)
  res.status(status).json(body)
}

function secureCookie(req: VercelRequest) {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
}

function cookieOptions(req: VercelRequest, maxAge: number) {
  return [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    ...(secureCookie(req) ? ['Secure'] : []),
  ].join('; ')
}

function setSessionCookies(req: VercelRequest, res: VercelResponse, session: AuthSession) {
  const accessMaxAge = Math.max(0, session.expires_in ?? 3600)
  res.setHeader('Set-Cookie', [
    `${ACCESS_COOKIE}=${session.access_token}; ${cookieOptions(req, accessMaxAge)}`,
    `${REFRESH_COOKIE}=${session.refresh_token}; ${cookieOptions(req, REFRESH_COOKIE_MAX_AGE)}`,
  ])
}

function clearSessionCookies(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', [
    `${ACCESS_COOKIE}=; ${cookieOptions(req, 0)}`,
    `${REFRESH_COOKIE}=; ${cookieOptions(req, 0)}`,
  ])
}

function cookieValue(req: VercelRequest, name: string): string | undefined {
  const parsedValue = req.cookies?.[name]
  if (parsedValue) return parsedValue

  const cookies = req.headers.cookie?.split(';') ?? []
  const cookie = cookies.find((part) => part.trim().startsWith(`${name}=`))
  return cookie?.trim().slice(name.length + 1)
}

async function supabaseRequest(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<{ response: Response; payload: AuthPayload }> {
  const { url, key } = getSupabaseConfig()
  const headers = new Headers(init.headers)
  headers.set('apikey', key)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(`${url}/auth/v1${path}`, { ...init, headers })
  const text = await response.text()
  let payload: AuthPayload = {}
  if (text) {
    try {
      payload = JSON.parse(text) as AuthPayload
    } catch {
      payload = {}
    }
  }
  return { response, payload }
}

function userForClient(user: AuthUser) {
  const metadata = user.user_metadata ?? {}
  const role = metadata.role === 'admin' ? 'admin' : 'comptable'
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: typeof metadata.full_name === 'string' ? metadata.full_name : '',
    role,
    company_id: typeof metadata.company_id === 'string' ? metadata.company_id : null,
    created_at: user.created_at ?? new Date().toISOString(),
  }
}

function authError(payload: AuthPayload) {
  return payload.message ?? payload.msg ?? payload.error_description ?? payload.error ?? ''
}

function signupError(status: number, payload: AuthPayload) {
  const message = authError(payload).toLowerCase()

  if (status === 429) return 'Trop de tentatives. Attendez quelques minutes avant de réessayer.'
  if (message.includes('already') || message.includes('registered')) {
    return 'Cette adresse e-mail est déjà utilisée.'
  }
  if (message.includes('redirect') || message.includes('url')) {
    return 'Supabase refuse l’URL de retour. Vérifiez Authentication → URL Configuration et ajoutez https://comptapilot.vercel.app/api/auth.'
  }
  if (message.includes('email') && (message.includes('disabled') || message.includes('provider'))) {
    return 'L’inscription par e-mail est désactivée dans Supabase Auth.'
  }
  if (message.includes('password')) {
    return 'Le mot de passe ne respecte pas les exigences configurées dans Supabase.'
  }
  if (status >= 500) {
    return 'Supabase n’a pas pu envoyer l’e-mail de confirmation. Vérifiez la configuration e-mail/SMTP du projet Supabase.'
  }
  return 'Supabase a refusé la création du compte. Vérifiez les paramètres Auth et réessayez.'
}

async function currentSession(req: VercelRequest, res: VercelResponse) {
  const accessToken = cookieValue(req, ACCESS_COOKIE)
  const refreshToken = cookieValue(req, REFRESH_COOKIE)
  if (!accessToken || !refreshToken) return null

  const current = await supabaseRequest('/user', { method: 'GET' }, accessToken)
  if (current.response.ok && current.payload.id) {
    return { user: current.payload as AuthUser, accessToken }
  }
  if (current.response.status !== 401 && current.response.status !== 403) {
    throw new Error(`Supabase user lookup failed (${current.response.status}).`)
  }

  const refreshed = await supabaseRequest('/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!refreshed.response.ok || !refreshed.payload.access_token ||
      !refreshed.payload.refresh_token || !refreshed.payload.user) {
    clearSessionCookies(req, res)
    return null
  }

  setSessionCookies(req, res, refreshed.payload as AuthSession)
  return {
    user: refreshed.payload.user,
    accessToken: refreshed.payload.access_token,
  }
}

function errorRedirect(req: VercelRequest, res: VercelResponse, flow: string) {
  const destination = flow === 'recovery' ? '/forgot-password?authError=recovery' : '/login?authError=confirmation'
  res.redirect(303, new URL(destination, appUrl(req)).toString())
}

async function handleCallback(req: VercelRequest, res: VercelResponse) {
  const flow = typeof req.query.flow === 'string' ? req.query.flow : ''
  const tokenHash = typeof req.query.token_hash === 'string' ? req.query.token_hash : ''
  const type = typeof req.query.type === 'string' ? req.query.type : ''
  const expectedType = flow === 'signup' ? 'signup' : flow === 'recovery' ? 'recovery' : ''

  if (!expectedType || type !== expectedType || !tokenHash) {
    errorRedirect(req, res, flow)
    return
  }

  const verified = await supabaseRequest('/verify', {
    method: 'POST',
    body: JSON.stringify({ token_hash: tokenHash, type }),
  })
  if (!verified.response.ok || !verified.payload.access_token ||
      !verified.payload.refresh_token || !verified.payload.user) {
    errorRedirect(req, res, flow)
    return
  }

  setSessionCookies(req, res, verified.payload as AuthSession)
  const destination = flow === 'recovery' ? '/reset-password' : '/dashboard'
  res.redirect(303, new URL(destination, appUrl(req)).toString())
}

function validEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validPassword(password: unknown): password is string {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128
}

function parseBody(body: unknown): ApiBody | null {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as ApiBody
    } catch {
      return null
    }
  }
  return body && typeof body === 'object' ? body as ApiBody : null
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const body = parseBody(req.body)
  if (!body) {
    json(res, 400, { error: 'Requête invalide.' })
    return
  }

  if (body.action === 'complete-callback') {
    if (
      typeof body.accessToken !== 'string' || body.accessToken.length > 8192 ||
      typeof body.refreshToken !== 'string' || body.refreshToken.length > 8192 ||
      (body.type !== 'signup' && body.type !== 'recovery')
    ) {
      json(res, 400, { error: 'La confirmation du lien est invalide.' })
      return
    }

    const verified = await supabaseRequest('/user', {
      method: 'GET',
    }, body.accessToken)
    if (!verified.response.ok || !verified.payload.id) {
      json(res, 401, { error: 'Le lien de confirmation est expiré ou invalide.' })
      return
    }

    const expiresIn = Number(body.expiresIn)
    const session: AuthSession = {
      access_token: body.accessToken,
      refresh_token: body.refreshToken,
      expires_in: Number.isFinite(expiresIn) ? Math.min(Math.max(expiresIn, 60), 86400) : 3600,
      user: verified.payload as AuthUser,
    }
    setSessionCookies(req, res, session)
    json(res, 200, { user: userForClient(session.user) })
    return
  }

  if (body.action === 'login') {
    if (!validEmail(body.email) || typeof body.password !== 'string' || !body.password) {
      json(res, 400, { error: 'Adresse e-mail ou mot de passe invalide.' })
      return
    }
    const result = await supabaseRequest('/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: body.email.trim(), password: body.password }),
    })
    if (!result.response.ok || !result.payload.user ||
        !result.payload.access_token || !result.payload.refresh_token) {
      const message = authError(result.payload).toLowerCase()
      const error = message.includes('not confirmed')
        ? 'Confirmez votre adresse e-mail avant de vous connecter.'
        : 'Adresse e-mail ou mot de passe incorrect.'
      json(res, 401, { error })
      return
    }
    setSessionCookies(req, res, result.payload as AuthSession)
    json(res, 200, { user: userForClient(result.payload.user) })
    return
  }

  if (body.action === 'register') {
    if (!validEmail(body.email) || !validPassword(body.password) ||
        typeof body.fullName !== 'string' || !body.fullName.trim() || body.fullName.length > 120 ||
        typeof body.companyName !== 'string' || !body.companyName.trim() || body.companyName.length > 160) {
      json(res, 400, { error: 'Vérifiez les informations saisies (mot de passe : 8 caractères minimum).' })
      return
    }
    const confirmationUrl = new URL('/api/auth?flow=signup', appUrl(req)).toString()
    const result = await supabaseRequest(`/signup?redirect_to=${encodeURIComponent(confirmationUrl)}`, {
      method: 'POST',
      body: JSON.stringify({
        email: body.email.trim(),
        password: body.password,
        data: { full_name: body.fullName.trim(), company_name: body.companyName.trim() },
      }),
    })
    if (!result.response.ok) {
      console.error('Supabase signup rejected:', {
        status: result.response.status,
        code: result.payload.code ?? 'unknown',
      })
      json(res, result.response.status === 429 ? 429 : 400, {
        error: signupError(result.response.status, result.payload),
      })
      return
    }
    json(res, 200, { success: true })
    return
  }

  if (body.action === 'request-reset') {
    if (!validEmail(body.email)) {
      json(res, 400, { error: 'Saisissez une adresse e-mail valide.' })
      return
    }
    const recoveryUrl = new URL('/api/auth?flow=recovery', appUrl(req)).toString()
    const result = await supabaseRequest(`/recover?redirect_to=${encodeURIComponent(recoveryUrl)}`, {
      method: 'POST',
      body: JSON.stringify({ email: body.email.trim() }),
    })
    if (!result.response.ok) {
      json(res, result.response.status === 429 ? 429 : 502, {
        error: 'Impossible d’envoyer l’e-mail de récupération pour le moment.',
      })
      return
    }
    json(res, 200, { success: true })
    return
  }

  if (body.action === 'update-password') {
    if (!validPassword(body.password)) {
      json(res, 400, { error: 'Le mot de passe doit contenir au moins 8 caractères.' })
      return
    }
    const session = await currentSession(req, res)
    if (!session) {
      json(res, 401, { error: 'Le lien de récupération est expiré. Demandez-en un nouveau.' })
      return
    }
    const result = await supabaseRequest('/user', {
      method: 'PUT',
      body: JSON.stringify({ password: body.password }),
    }, session.accessToken)
    if (!result.response.ok) {
      json(res, 400, { error: 'Impossible de modifier le mot de passe. Demandez un nouveau lien de récupération.' })
      return
    }
    json(res, 200, { success: true })
    return
  }

  if (body.action === 'logout') {
    const accessToken = cookieValue(req, ACCESS_COOKIE)
    clearSessionCookies(req, res)
    if (accessToken) {
      try {
        const result = await supabaseRequest('/logout', { method: 'POST' }, accessToken)
        if (!result.response.ok && result.response.status !== 401) {
          json(res, 200, {
            success: true,
            warning: 'La session locale est fermée, mais Supabase n’a pas confirmé la révocation.',
          })
          return
        }
      } catch (error) {
        console.error(
          'Supabase logout failure:',
          error instanceof Error ? error.message : 'Unknown server error.',
        )
        json(res, 200, {
          success: true,
          warning: 'La session locale est fermée, mais Supabase n’a pas confirmé la révocation.',
        })
        return
      }
    }
    json(res, 200, { success: true })
    return
  }

  json(res, 400, { error: 'Action d’authentification inconnue.' })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setNoCache(res)

  try {
    if (req.method === 'GET') {
      if (req.query.token_hash !== undefined || req.query.flow !== undefined) {
        await handleCallback(req, res)
        return
      }
      const session = await currentSession(req, res)
      json(res, 200, { user: session ? userForClient(session.user) : null })
      return
    }
    if (req.method === 'POST') {
      await handlePost(req, res)
      return
    }
    res.setHeader('Allow', 'GET, POST')
    json(res, 405, { error: 'Méthode non autorisée.' })
  } catch (error) {
    console.error(
      'Auth API failure:',
      error instanceof Error ? error.message : 'Unknown server error.',
    )
    json(res, 503, { error: 'Le service d’authentification est temporairement indisponible.' })
  }
}
