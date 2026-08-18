import type { Currency, Expense } from './types'

export function totalsByCurrency(expenses: Expense[]): Record<Currency, number> {
  return expenses.reduce<Record<Currency, number>>((totals, expense) => {
    totals[expense.currency] += Number(expense.amount)
    return totals
  }, { KRW: 0, MNT: 0 })
}

export function dateForDay(startDate: string | null, day: number): Date | null {
  if (!startDate || day < 1 || day > 6) return null
  const date = new Date(`${startDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + day - 1)
  return date
}

export function progress(completed: number, total: number): number {
  return total > 0 ? Math.round(completed / total * 100) : 0
}
