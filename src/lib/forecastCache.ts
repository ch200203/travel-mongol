const PREFIX = 'mongolia-friends-trip:forecast:'

/** 이보다 오래된 예보는 날짜를 붙여 보여줘도 판단에 도움이 되지 않으므로 버린다. */
export const maxCacheAgeMs = 14 * 24 * 60 * 60 * 1000

export interface CachedForecast<T> {
  savedAt: number
  data: T
}

/**
 * 고비 구간은 신호가 없어 예보 요청이 그냥 실패한다. 마지막으로 받은 값을 남겨두면
 * 빈 화면 대신 "언제 받은 것인지 밝힌" 값을 보여줄 수 있다.
 */
export function saveForecast<T>(key: string, data: T, now = Date.now()): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify({ savedAt: now, data }))
  } catch {
    // 저장 공간이 없거나 사생활 보호 모드면 캐시를 포기한다. 화면 동작은 그대로 유지한다.
  }
}

export function loadForecast<T>(key: string, now = Date.now()): CachedForecast<T> | null {
  let raw: string | null
  try {
    raw = localStorage.getItem(`${PREFIX}${key}`)
  } catch {
    return null
  }
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<CachedForecast<T>>
    if (typeof parsed?.savedAt !== 'number' || parsed.data === undefined) return null
    // 시계가 뒤로 간 기기에서 savedAt이 미래로 찍힐 수 있어 음수 경과도 버린다.
    const age = now - parsed.savedAt
    if (age < 0 || age > maxCacheAgeMs) return null
    return { savedAt: parsed.savedAt, data: parsed.data as T }
  } catch {
    return null
  }
}

export function formatSavedAt(savedAt: number): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(savedAt))
}

/**
 * fetch는 네트워크 자체가 끊기면 TypeError로 거절하고, 그 message는 'Failed to fetch' 같은
 * 브라우저 영문이라 그대로 화면에 낼 수 없다. 우리가 직접 던진 Error의 한국어 메시지는 살린다.
 */
export function describeFetchError(caught: unknown, fallback: string): string {
  if (caught instanceof TypeError) return '네트워크에 연결되어 있지 않아 최신 정보를 받지 못했어요.'
  return caught instanceof Error && caught.message ? caught.message : fallback
}
