import { describe, expect, it } from 'vitest'
import { dayGuides, totalDriving } from './dayGuide'

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
})
