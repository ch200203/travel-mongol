import { useMemo, useState } from 'react'
import { deleteRow, insertRow, updateRow } from '../../lib/supabase/repository'
import type { Currency, Expense, ExpenseCategory, TripData } from '../../lib/types'
import { totalsByCurrency } from '../../lib/tripLogic'

interface Props { data: TripData; mutate: (operation: () => Promise<void>) => Promise<void> }
const categories: Record<ExpenseCategory, string> = { transport: '교통', food: '식비', lodging: '숙박', sightseeing: '관광', shopping: '쇼핑', other: '기타' }
const money = (value: number, currency: Currency) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency, maximumFractionDigits: currency === 'KRW' ? 0 : 2 }).format(value)

export function ExpensesPage({ data, mutate }: Props) {
  const [editing, setEditing] = useState<Expense | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [payer, setPayer] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')

  const filtered = data.expenses.filter((expense) => (!payer || expense.paid_by_member_id === payer) && (!category || expense.category === category) && (!date || expense.spent_on === date))
  const totals = useMemo(() => totalsByCurrency(data.expenses), [data.expenses])
  const payerTotals = useMemo(() => data.expenses.reduce<Record<string, Record<string, number>>>((sum, expense) => {
    const current = sum[expense.paid_by_member_id] ?? {}
    return { ...sum, [expense.paid_by_member_id]: { ...current, [expense.currency]: (current[expense.currency] ?? 0) + Number(expense.amount) } }
  }, {}), [data.expenses])
  const name = (id: string) => data.members.find((m) => m.id === id)?.name ?? '알 수 없음'

  async function submit(form: HTMLFormElement) {
    const formData = new FormData(form)
    const values = {
      trip_id: data.trip.id,
      title: String(formData.get('title')).trim(),
      amount: Number(formData.get('amount')),
      currency: String(formData.get('currency')),
      paid_by_member_id: String(formData.get('payer')),
      spent_on: String(formData.get('spent_on')),
      category: String(formData.get('category')),
      note: String(formData.get('note')).trim() || null,
    }
    await mutate(() => editing ? updateRow('expenses', editing.id, values) : insertRow('expenses', values))
    setEditing(null); setShowForm(false)
  }

  function beginEdit(expense: Expense) { setEditing(expense); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  async function remove(expense: Expense) { if (window.confirm(`“${expense.title}” 비용을 삭제할까요?`)) await mutate(() => deleteRow('expenses', expense.id)) }

  return (
    <section>
      <div className="section-heading"><div><span className="eyebrow">SHARED LEDGER</span><h2>공동 장부</h2><p>통화는 환산하지 않고 따로 집계해요.</p></div><button onClick={() => { setEditing(null); setShowForm(!showForm) }}>+ 비용 기록</button></div>
      <FundPanel data={data} mutate={mutate} />
      <div className="summary-grid">
        {(['KRW', 'MNT'] as Currency[]).map((currency) => <div className="summary-card" key={currency}><span>{currency} 전체</span><strong>{money(totals[currency] ?? 0, currency)}</strong></div>)}
      </div>
      {showForm && <ExpenseForm members={data.members} expense={editing} onSubmit={submit} onCancel={() => { setShowForm(false); setEditing(null) }} />}
      <div className="filters" aria-label="비용 필터">
        <select value={payer} onChange={(e) => setPayer(e.target.value)} aria-label="결제자 필터"><option value="">모든 결제자</option>{data.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="분류 필터"><option value="">모든 분류</option>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="사용일 필터" />
        {(payer || category || date) && <button className="ghost compact" onClick={() => { setPayer(''); setCategory(''); setDate('') }}>초기화</button>}
      </div>
      {filtered.length === 0 ? <div className="empty">조건에 맞는 비용이 없어요.</div> : <div className="card-list">{filtered.map((expense) => (
        <article className="item-card expense-card" key={expense.id}>
          <div><span className="category-tag">{categories[expense.category]}</span><h3>{expense.title}</h3><p>{expense.spent_on} · {name(expense.paid_by_member_id)} 결제</p>{expense.note && <p className="note">{expense.note}</p>}</div>
          <div className="item-actions"><strong>{money(Number(expense.amount), expense.currency)}</strong><span><button className="text-button" onClick={() => beginEdit(expense)}>수정</button><button className="text-button danger" onClick={() => void remove(expense)}>삭제</button></span></div>
        </article>
      ))}</div>}
      {Object.keys(payerTotals).length > 0 && <details className="payer-totals"><summary>결제자별 합계</summary>{data.members.map((member) => payerTotals[member.id] && <p key={member.id}><b>{member.name}</b> {Object.entries(payerTotals[member.id]).map(([currency, amount]) => money(amount, currency as Currency)).join(' · ')}</p>)}</details>}
    </section>
  )
}

function FundPanel({ data, mutate }: Props) {
  const fund = data.sharedFunds[0]
  const [editingTarget, setEditingTarget] = useState(false)
  const [showContribution, setShowContribution] = useState(false)
  if (!fund) return null
  const contributions = data.fundContributions.filter((item) => item.fund_id === fund.id)
  const collected = contributions.reduce((sum, item) => sum + Number(item.amount), 0)
  const target = Number(fund.target_amount)
  const percent = target > 0 ? Math.min(100, Math.round(collected / target * 100)) : 0
  const remaining = Math.max(0, target - collected)
  const memberTotals = data.members.map((member) => ({ member, amount: contributions.filter((item) => item.member_id === member.id).reduce((sum, item) => sum + Number(item.amount), 0) }))

  async function saveTarget(form: HTMLFormElement) {
    const values = new FormData(form)
    await mutate(() => updateRow('shared_funds', fund.id, { name: String(values.get('name')).trim(), target_amount: Number(values.get('target')) }))
    setEditingTarget(false)
  }
  async function addContribution(form: HTMLFormElement) {
    const values = new FormData(form)
    await mutate(() => insertRow('fund_contributions', {
      trip_id: data.trip.id,
      fund_id: fund.id,
      member_id: String(values.get('member')),
      amount: Number(values.get('amount')),
      contributed_on: String(values.get('date')),
      note: String(values.get('note')).trim() || null,
    }))
    setShowContribution(false)
  }
  async function removeContribution(id: string) {
    if (window.confirm('이 공금 입금 기록을 삭제할까요?')) await mutate(() => deleteRow('fund_contributions', id))
  }

  return <section className="fund-panel" aria-labelledby="fund-title">
    <header><div><span className="eyebrow">GROUP FUND</span><h3 id="fund-title">{fund.name}</h3></div><div><button className="ghost compact" onClick={() => setEditingTarget(!editingTarget)}>목표 설정</button><button className="compact" onClick={() => setShowContribution(!showContribution)}>+ 입금 기록</button></div></header>
    <div className="fund-overview"><div><small>현재 모금액</small><strong>{money(collected, fund.currency)}</strong></div><div><small>목표</small><b>{target > 0 ? money(target, fund.currency) : '미설정'}</b></div><div><small>남은 금액</small><b>{target > 0 ? money(remaining, fund.currency) : '—'}</b></div></div>
    <div className="fund-progress"><i style={{ width: `${percent}%` }} /><span>{target > 0 ? `${percent}%` : '목표 금액을 설정해 주세요'}</span></div>
    {editingTarget && <form className="fund-form" onSubmit={(event) => { event.preventDefault(); void saveTarget(event.currentTarget) }}><label>공금 이름<input name="name" required maxLength={50} defaultValue={fund.name} /></label><label>목표 금액 (KRW)<input name="target" type="number" min="0" step="1" required defaultValue={target} /></label><button>저장</button></form>}
    {showContribution && <form className="fund-form" onSubmit={(event) => { event.preventDefault(); void addContribution(event.currentTarget) }}><label>입금자<select name="member" required defaultValue=""><option value="" disabled>선택</option>{data.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label><label>입금액 (KRW)<input name="amount" type="number" min="1" step="1" required /></label><label>입금일<input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} /></label><label>메모<input name="note" maxLength={200} placeholder="선택" /></label><button>저장</button></form>}
    <div className="fund-members">{memberTotals.map(({ member, amount }) => <span key={member.id}><b>{member.name}</b><small>{money(amount, fund.currency)}</small></span>)}</div>
    {contributions.length > 0 && <details className="fund-history"><summary>입금 내역 {contributions.length}건</summary>{contributions.map((item) => <p key={item.id}><span>{item.contributed_on} · {data.members.find((member) => member.id === item.member_id)?.name}{item.note && ` · ${item.note}`}</span><b>{money(Number(item.amount), fund.currency)}</b><button className="text-button danger" onClick={() => void removeContribution(item.id)}>삭제</button></p>)}</details>}
  </section>
}

function ExpenseForm({ members, expense, onSubmit, onCancel }: { members: TripData['members']; expense: Expense | null; onSubmit: (form: HTMLFormElement) => Promise<void>; onCancel: () => void }) {
  return <form className="edit-form" onSubmit={(e) => { e.preventDefault(); void onSubmit(e.currentTarget) }}>
    <h3>{expense ? '비용 수정' : '새 비용'}</h3>
    <label>사용 내용<input name="title" required maxLength={100} defaultValue={expense?.title} placeholder="예: 공항 택시" /></label>
    <div className="form-row"><label>금액<input name="amount" type="number" required min="0.01" step="0.01" defaultValue={expense?.amount} /></label><label>통화<select name="currency" defaultValue={expense?.currency ?? 'KRW'}><option>KRW</option><option>MNT</option></select></label></div>
    <div className="form-row"><label>결제자<select name="payer" required defaultValue={expense?.paid_by_member_id ?? ''}><option value="" disabled>선택</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label><label>사용일<input name="spent_on" type="date" required defaultValue={expense?.spent_on ?? new Date().toISOString().slice(0, 10)} /></label></div>
    <label>분류<select name="category" defaultValue={expense?.category ?? 'other'}>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <label>메모 (선택)<textarea name="note" maxLength={500} defaultValue={expense?.note ?? ''} /></label>
    <div className="form-actions"><button type="button" className="ghost" onClick={onCancel}>취소</button><button type="submit">저장</button></div>
  </form>
}
