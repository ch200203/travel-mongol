import { describe, expect, it } from 'vitest'
import { dateForDay, progress, totalsByCurrency } from './tripLogic'
import type { Expense } from './types'

const expense = (amount: number, currency: 'KRW' | 'MNT'): Expense => ({
  id: crypto.randomUUID(), trip_id: 'trip', title: '테스트', amount, currency,
  paid_by_member_id: 'member', spent_on: '2026-08-18', category: 'other',
  note: null, created_at: '2026-08-18T00:00:00Z',
})

describe('trip calculations', () => {
  it('통화별 합계를 섞지 않는다', () => {
    expect(totalsByCurrency([expense(1000, 'KRW'), expense(250, 'MNT'), expense(500, 'KRW')]))
      .toEqual({ KRW: 1500, MNT: 250 })
  })

  it('여행 시작일로 Day 1~6 날짜를 계산한다', () => {
    expect(dateForDay('2026-09-28', 1)?.toISOString().slice(0, 10)).toBe('2026-09-28')
    expect(dateForDay('2026-09-28', 6)?.toISOString().slice(0, 10)).toBe('2026-10-03')
    expect(dateForDay('2026-09-28', 7)).toBeNull()
  })

  it('빈 체크리스트의 진행률은 0이다', () => {
    expect(progress(0, 0)).toBe(0)
    expect(progress(4, 6)).toBe(67)
  })
})
