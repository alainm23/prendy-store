const store = new Map<string, { data: unknown; expires: number }>();
const DEFAULT_TTL = 60_000; // 1 minuto

export function get<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function set(key: string, data: unknown, ttl: number = DEFAULT_TTL): void {
  store.set(key, { data, expires: Date.now() + ttl });
}

export function invalidate(key: string): void {
  store.delete(key);
}

export function invalidateByPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

export function clear(): void {
  store.clear();
}
