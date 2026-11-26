// Limiteur de débit en mémoire (par instance). Suffisant pour freiner l'abus
// basique ; en multi-instances/serverless, utiliser un store partagé (Upstash/Redis).
const hits = new Map<string, { count: number; reset: number }>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs })
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
    }
    return true
  }
  entry.count++
  return entry.count <= limit
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
