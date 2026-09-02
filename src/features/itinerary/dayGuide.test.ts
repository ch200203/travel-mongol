import { describe, expect, it } from 'vitest'
import { dayGuides, hasUtilityLimit, totalDriving, totalLodgingSurchargeWon } from './dayGuide'

describe('quote-based day guide', () => {
  it('covers all six days and the quoted driving total', () => {
    expect(dayGuides.map((guide) => guide.day)).toEqual([1, 2, 3, 4, 5, 6])
    expect(totalDriving).toEqual({ hours: 31, km: 2000 })
  })

  it('keeps internet available at every overnight camp', () => {
    const overnightGuides = dayGuides.filter((guide) => guide.lodging)
    expect(overnightGuides).toHaveLength(5)
    for (const guide of overnightGuides) {
      expect(guide.lodging?.utilities.internet).toBe('가능')
    }
    expect(dayGuides[5].lodging).toBeNull()
  })

  it('reflects the selected lodging upgrades and surcharge', () => {
    expect(dayGuides.slice(0, 5).map((guide) => [guide.lodging?.name, guide.lodging?.roomType])).toEqual([
      ['고급 캠프', '게르형 객실'],
      ['고급 캠프', '게르형 객실'],
      ['고급 캠프', '오두막'],
      ['여행자 캠프', '오두막'],
      ['고급 캠프', '상위 등급 객실'],
    ])
    expect(totalLodgingSurchargeWon).toBe(110_000)
    expect(dayGuides[4].lodging?.complimentaryUpgrade).toBe(true)
  })

  it('uses the confirmed meal changes from the team schedule', () => {
    expect(dayGuides[0].meals.dinner).toBe('캠프식')
    expect(dayGuides[1].meals.breakfast).toBe('캠프식')
    expect(dayGuides[2].meals.dinner).toBe('특식(삼겹살)')
    expect(dayGuides[4].meals.dinner).toBe('현지 식당')
  })

  it('carries the per-camp power and shower windows from the operator notice', () => {
    expect(dayGuides.slice(0, 5).map((guide) => [guide.lodging?.utilities.power, guide.lodging?.utilities.shower])).toEqual([
      ['무제한', '무제한'],
      ['무제한', '무제한'],
      ['23:00까지', '18:00~23:00'],
      ['무제한', '19:00~23:00'],
      ['무제한', '무제한'],
    ])
  })

  it('flags only the camps whose power or shower is time-limited', () => {
    const limited = dayGuides.filter((guide) => guide.lodging && hasUtilityLimit(guide.lodging)).map((guide) => guide.day)
    expect(limited).toEqual([3, 4])
  })

  it('ends the tour with the final airport and boarding times', () => {
    expect(dayGuides[5].highlights).toContain('16:30 공항 도착')
    expect(dayGuides[5].highlights).toContain('18:15 비행기 탑승')
  })
})
