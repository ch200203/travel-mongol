import { describe, expect, it } from 'vitest'
import { forecastAvailable, weatherLabel } from './weather'

describe('trip weather', () => {
  it('16일 예보 범위에 들어올 때만 조회한다', () => {
    expect(forecastAvailable(new Date('2026-08-24T12:00:00+09:00'))).toBe(false)
    expect(forecastAvailable(new Date('2026-08-25T12:00:00+09:00'))).toBe(true)
  })

  it('WMO 날씨 코드를 사용자 문구로 바꾼다', () => {
    expect(weatherLabel(0)).toEqual({ icon: '☀️', text: '맑음' })
    expect(weatherLabel(63).text).toBe('비')
    expect(weatherLabel(95).text).toBe('뇌우')
  })
})
