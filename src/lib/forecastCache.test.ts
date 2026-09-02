import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { describeFetchError, loadForecast, maxCacheAgeMs, saveForecast } from './forecastCache'

/** 테스트는 node 환경에서 돌아 localStorage가 없으므로 최소 구현을 끼워 넣는다. */
function stubStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() { return store.size },
  } as Storage
}

const now = Date.UTC(2026, 8, 8, 12, 0, 0)

beforeEach(() => { globalThis.localStorage = stubStorage() })
afterEach(() => { Reflect.deleteProperty(globalThis, 'localStorage') })

describe('forecast cache', () => {
  it('returns what was saved along with the time it was saved', () => {
    saveForecast('trip-weather', [{ day: 1, temperatureMax: 21 }], now)
    const cached = loadForecast<Array<{ day: number; temperatureMax: number }>>('trip-weather', now + 60_000)
    expect(cached?.savedAt).toBe(now)
    expect(cached?.data).toEqual([{ day: 1, temperatureMax: 21 }])
  })

  it('keeps entries separate per key', () => {
    saveForecast('trip-weather', ['weather'], now)
    saveForecast('night-skies', ['skies'], now)
    expect(loadForecast<string[]>('trip-weather', now)?.data).toEqual(['weather'])
    expect(loadForecast<string[]>('night-skies', now)?.data).toEqual(['skies'])
  })

  it('drops a forecast older than the cache limit', () => {
    saveForecast('trip-weather', ['stale'], now)
    expect(loadForecast('trip-weather', now + maxCacheAgeMs - 1)).not.toBeNull()
    expect(loadForecast('trip-weather', now + maxCacheAgeMs + 1)).toBeNull()
  })

  it('drops an entry stamped in the future, which means the clock moved back', () => {
    saveForecast('trip-weather', ['future'], now)
    expect(loadForecast('trip-weather', now - 60_000)).toBeNull()
  })

  it('returns null rather than throwing on damaged or foreign content', () => {
    localStorage.setItem('mongolia-friends-trip:forecast:trip-weather', '{not json')
    expect(loadForecast('trip-weather', now)).toBeNull()
    localStorage.setItem('mongolia-friends-trip:forecast:trip-weather', '{"data":[1]}')
    expect(loadForecast('trip-weather', now)).toBeNull()
  })

  it('returns null when nothing was ever saved', () => {
    expect(loadForecast('never-written', now)).toBeNull()
  })

  it('survives storage that refuses to write', () => {
    globalThis.localStorage = { ...stubStorage(), setItem: () => { throw new Error('QuotaExceeded') } } as Storage
    expect(() => saveForecast('trip-weather', ['x'], now)).not.toThrow()
  })
})

describe('fetch error copy', () => {
  it('replaces the browser network error with Korean copy', () => {
    // 오프라인에서 fetch는 TypeError('Failed to fetch')로 거절한다.
    expect(describeFetchError(new TypeError('Failed to fetch'), '기본값')).toBe('네트워크에 연결되어 있지 않아 최신 정보를 받지 못했어요.')
  })

  it('keeps our own Korean messages', () => {
    expect(describeFetchError(new Error('날씨 예보를 불러오지 못했습니다.'), '기본값')).toBe('날씨 예보를 불러오지 못했습니다.')
  })

  it('falls back when the thrown value carries no message', () => {
    expect(describeFetchError(new Error(''), '기본값')).toBe('기본값')
    expect(describeFetchError('문자열', '기본값')).toBe('기본값')
  })
})
