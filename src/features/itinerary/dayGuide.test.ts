import { describe, expect, it } from 'vitest'
import { dayGuides, totalDriving, totalLodgingSurchargeWon } from './dayGuide'

describe('quote-based day guide', () => {
  it('covers all six days and the quoted driving total', () => {
    expect(dayGuides.map((guide) => guide.day)).toEqual([1, 2, 3, 4, 5, 6])
    expect(totalDriving).toEqual({ hours: 31, km: 2000 })
  })

  it('shows the three stated amenities for every overnight camp', () => {
    const overnightGuides = dayGuides.filter((guide) => guide.lodging)
    expect(overnightGuides).toHaveLength(5)
    for (const guide of overnightGuides) {
      expect(guide.lodging?.amenities).toEqual(['전기 가능', '인터넷 가능', '샤워 가능'])
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
})
