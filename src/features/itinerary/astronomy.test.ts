import { describe, expect, it } from 'vitest'
import { buildSkySchedule, moonForDate } from './astronomy'

describe('trip astronomy', () => {
  it('여행 6일의 현지 일출·일몰과 별 관측 시간대를 계산한다', () => {
    const schedule = buildSkySchedule('2026-09-09')

    expect(schedule).toHaveLength(6)
    expect(schedule[0]).toMatchObject({ day: 1, date: '2026-09-09', location: '차강소브라가' })
    expect(schedule[5]).toMatchObject({ day: 6, date: '2026-09-14', location: '울란바토르' })
    for (const day of schedule) {
      expect(day.sunrise).toMatch(/^0[56]:\d{2}$/)
      expect(day.sunset).toMatch(/^19:\d{2}$/)
      expect(day.starWindow).toMatch(/^2[01]:\d{2}–0[45]:\d{2}$/)
    }
  })

  it('여행 기간의 달 밝기를 유효한 비율과 안내 문구로 제공한다', () => {
    const moon = moonForDate('2026-09-11')

    expect(moon.moonIllumination).toBeGreaterThanOrEqual(0)
    expect(moon.moonIllumination).toBeLessThanOrEqual(1)
    expect(moon.moonLabel.length).toBeGreaterThan(0)
    expect(moon.viewingNote).toContain('별 보기 좋은')
  })
})
