import { getRequestHeader } from '@tanstack/react-start/server'

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

export async function sha(input: string) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)))
}

export async function hashedIp() {
  const fwd = getRequestHeader('x-forwarded-for') ?? getRequestHeader('x-real-ip') ?? 'unknown'
  const ip = fwd.split(',')[0].trim()
  return (await sha(`${process.env.IP_HASH_SALT ?? 'loob-ledger-dev-salt'}:${ip}`)).slice(0, 32)
}

/** Fixed-window rate limit. Uses Upstash Redis when configured, otherwise per-instance memory. */
const mem = new Map<string, { n: number; reset: number }>()
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const base = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (base && token) {
    try {
      const k = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`
      const res = await fetch(`${base}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', k], ['EXPIRE', k, String(windowSec)]]),
      })
      const out = (await res.json()) as { result: number }[]
      return out[0].result <= max
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now()
  const e = mem.get(key)
  if (!e || e.reset < now) { mem.set(key, { n: 1, reset: now + windowSec * 1000 }); return true }
  e.n++
  return e.n <= max
}

export async function verifyTurnstile(token: string | undefined, ipHint?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured: honeypot, timing and rate limits still apply
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token })
  if (ipHint) body.set('remoteip', ipHint)
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
  const j = (await res.json()) as { success: boolean }
  return j.success
}

const BLOCKED = ['putang', 'tangina', 'tang ina', 'puta ka', 'fuck', 'shit', 'bitch', 'bastard', 'nigg', 'faggot', 'retard']
export function checkContent(name: string, body: string): string | null {
  const text = `${name} ${body}`.toLowerCase()
  if (/(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|io|ph|co)\b)/i.test(text)) return 'Links are turned off for now. Please remove the link.'
  if (/(.)\1{9,}/.test(body)) return 'That looks like repeated characters. Please rewrite it.'
  const letters = body.replace(/[^a-zA-Z]/g, '')
  if (letters.length > 24 && letters.replace(/[^A-Z]/g, '').length / letters.length > 0.7) return 'Please avoid writing in all capitals.'
  if (BLOCKED.some((w) => text.includes(w))) return 'Please keep it kind. This comment can’t be posted as written.'
  return null
}

/** Signed admin session cookie. */
export async function sign(value: string) {
  const secret = process.env.SESSION_SECRET ?? 'dev-only-secret-change-me'
  return `${value}.${(await sha(`${secret}:${value}`)).slice(0, 40)}`
}
export async function verifySigned(cookie: string | undefined) {
  if (!cookie) return false
  const i = cookie.lastIndexOf('.')
  if (i < 0) return false
  const value = cookie.slice(0, i)
  const exp = Number(value.split(':')[1] ?? 0)
  return exp > Date.now() && cookie === (await sign(value))
}
