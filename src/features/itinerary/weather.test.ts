import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchTripWeather, forecastAvailable, weatherLabel, weatherLocations } from './weather'

function forecastFor(dates: string[]) {
  return weatherLocations.map(() => ({
    daily: {
      time: dates,
      weather_code: dates.map(() => 0),
      temperature_2m_max: dates.map(() => 20),
      temperature_2m_min: dates.map(() => 5),
      precipitation_probability_max: dates.map(() => 10),
      wind_speed_10m_max: dates.map(() => 15),
    },
  }))
}

describe('trip weather', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('16일 예보 범위에 들어올 때만 조회한다', () => {
    expect(forecastAvailable(new Date('2026-08-24T12:00:00+09:00'))).toBe(false)
    expect(forecastAvailable(new Date('2026-08-25T12:00:00+09:00'))).toBe(true)
  })

  it('날짜 범위 대신 forecast_days로 요청한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => forecastFor(['2026-09-09']) })
    vi.stubGlobal('fetch', fetchMock)
    await fetchTripWeather()
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.get('forecast_days')).toBe('16')
    expect(url.searchParams.has('end_date')).toBe(false)
  })

  it('예보 범위 밖 일차는 오류 대신 건너뛴다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => forecastFor(['2026-09-09', '2026-09-10']) }))
    const days = await fetchTripWeather()
    expect(days.map((day) => day.day)).toEqual([1, 2])
  })

  it('값이 비어 있는 날은 예보로 취급하지 않는다', async () => {
    const forecasts = forecastFor(['2026-09-09', '2026-09-10'])
    for (const forecast of forecasts) {
      forecast.daily.weather_code[1] = null as unknown as number
      forecast.daily.temperature_2m_max[1] = null as unknown as number
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => forecasts }))
    const days = await fetchTripWeather()
    expect(days.map((day) => day.day)).toEqual([1])
  })

  it('예보가 하나도 없으면 오류를 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => forecastFor(['2026-08-26']) }))
    await expect(fetchTripWeather()).rejects.toThrow('여행 날짜의 예보가 아직 제공되지 않습니다.')
  })

  it('WMO 날씨 코드를 사용자 문구로 바꾼다', () => {
    expect(weatherLabel(0)).toEqual({ icon: '☀️', text: '맑음' })
    expect(weatherLabel(63).text).toBe('비')
    expect(weatherLabel(95).text).toBe('뇌우')
  })
})
