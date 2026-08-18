import { useState } from 'react'
import { deleteRow, insertRow, setCommonCheck, updateRow } from '../../lib/supabase/repository'
import type { CommonTask, PersonalItem, TripData } from '../../lib/types'
import { progress } from '../../lib/tripLogic'

interface Props { data: TripData; mutate: (operation: () => Promise<void>) => Promise<void> }

export function PreparationPage({ data, mutate }: Props) {
  const [mode, setMode] = useState<'common' | 'personal'>('common')
  return <section>
    <div className="section-heading"><div><span className="eyebrow">READY TO GO</span><h2>준비물</h2><p>여섯 명의 준비 상태를 함께 확인해요.</p></div></div>
    <div className="segmented"><button className={mode === 'common' ? 'active' : ''} onClick={() => setMode('common')}>공통 준비</button><button className={mode === 'personal' ? 'active' : ''} onClick={() => setMode('personal')}>개인 준비물</button></div>
    {mode === 'common' ? <CommonPreparation data={data} mutate={mutate} /> : <PersonalPreparation data={data} mutate={mutate} />}
  </section>
}

function CommonPreparation({ data, mutate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CommonTask | null>(null)
  const completed = data.checks.filter((check) => check.is_completed).length
  const total = data.tasks.length * data.members.length
  const overall = progress(completed, total)
  const checkFor = (taskId: string, memberId: string) => data.checks.find((check) => check.task_id === taskId && check.member_id === memberId)

  async function toggle(taskId: string, memberId: string, next: boolean) {
    await mutate(() => setCommonCheck({ trip_id: data.trip.id, task_id: taskId, member_id: memberId, is_completed: next, completed_at: next ? new Date().toISOString() : null }))
  }
  async function submit(form: HTMLFormElement) {
    const values = new FormData(form)
    const row = { trip_id: data.trip.id, title: String(values.get('title')).trim(), due_date: String(values.get('due_date')) || null, category: String(values.get('category')), sort_order: editing?.sort_order ?? data.tasks.length }
    await mutate(() => editing ? updateRow('common_preparation_tasks', editing.id, row) : insertRow('common_preparation_tasks', row))
    setEditing(null); setShowForm(false)
  }
  async function remove(task: CommonTask) { if (window.confirm(`“${task.title}” 과제와 모든 체크 기록을 삭제할까요?`)) await mutate(() => deleteRow('common_preparation_tasks', task.id)) }
  async function move(task: CommonTask, direction: -1 | 1) {
    const index = data.tasks.findIndex((item) => item.id === task.id)
    const other = data.tasks[index + direction]
    if (!other) return
    await mutate(async () => { await updateRow('common_preparation_tasks', task.id, { sort_order: other.sort_order }); await updateRow('common_preparation_tasks', other.id, { sort_order: task.sort_order }) })
  }

  return <>
    <PaymentProgress data={data} />
    <div className="progress-panel"><div><span>전체 진행률</span><strong>{overall}%</strong></div><div className="progress"><i style={{ width: `${overall}%` }} /></div><small>{completed} / {total} 완료</small></div>
    <div className="subheading"><h3>모두가 해야 할 일</h3><button onClick={() => { setEditing(null); setShowForm(!showForm) }}>+ 과제 추가</button></div>
    {showForm && <form className="edit-form compact-form" onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget) }}><label>과제명<input name="title" required maxLength={100} defaultValue={editing?.title} /></label><label>구분<select name="category" defaultValue={editing?.category ?? 'required'}><option value="required">필수</option><option value="optional">선택</option></select></label><label>마감일 (선택)<input name="due_date" type="date" defaultValue={editing?.due_date ?? ''} /></label><div className="form-actions"><button type="button" className="ghost" onClick={() => { setShowForm(false); setEditing(null) }}>취소</button><button>저장</button></div></form>}
    {(['required', 'optional'] as const).map((category) => <section className="task-section" key={category}><div className="task-section-title"><span className={`priority-badge ${category}`}>{category === 'required' ? '필수' : '선택'}</span><h3>{category === 'required' ? '출발 전 반드시 확인' : '팀에서 선택할 항목'}</h3></div><div className="task-grid">{data.tasks.filter((task) => task.category === category).map((task) => {
      const index = data.tasks.findIndex((item) => item.id === task.id)
      const taskCompleted = data.members.filter((member) => checkFor(task.id, member.id)?.is_completed).length
      return <article className="task-card" key={task.id}>
        <header><div><h3>{task.title}</h3><p>{task.due_date ? `${task.due_date}까지` : '마감일 없음'} · {taskCompleted}/{data.members.length}명</p></div><div className="task-tools"><button className="icon" aria-label="위로 이동" disabled={index === 0} onClick={() => void move(task, -1)}>↑</button><button className="icon" aria-label="아래로 이동" disabled={index === data.tasks.length - 1} onClick={() => void move(task, 1)}>↓</button><button className="text-button" onClick={() => { setEditing(task); setShowForm(true) }}>수정</button><button className="text-button danger" onClick={() => void remove(task)}>삭제</button></div></header>
        <div className="member-checks">{data.members.map((member) => { const check = checkFor(task.id, member.id); return <label className={check?.is_completed ? 'checked' : ''} key={member.id}><input type="checkbox" checked={check?.is_completed ?? false} onChange={(e) => void toggle(task.id, member.id, e.target.checked)} /><span>{member.name}</span>{check?.completed_at && <small>{new Date(check.completed_at).toLocaleDateString('ko-KR')}</small>}</label> })}</div>
      </article>
    })}</div></section>)}
  </>
}

function PaymentProgress({ data }: { data: TripData }) {
  const stages = [
    { title: '예약금 입금', amount: '1인 21만원', task: data.tasks.find((item) => item.title.includes('예약금')) },
    { title: '현지 잔금 준비', amount: '1인 95만원', task: data.tasks.find((item) => item.title.includes('현지 잔금')) },
  ]
  return <section className="payment-progress" aria-labelledby="payment-progress-title">
    <div><span className="eyebrow">PAYMENT STEPS</span><h3 id="payment-progress-title">결제 단계</h3></div>
    <ol>{stages.map((stage, index) => {
      const count = stage.task ? data.checks.filter((check) => check.task_id === stage.task?.id && check.is_completed).length : 0
      const complete = count === data.members.length
      return <li className={complete ? 'complete' : ''} key={stage.title}><i>{complete ? '✓' : index + 1}</i><div><small>{index + 1}단계</small><strong>{stage.title}</strong><span>{stage.amount}</span></div><b>{count}/{data.members.length}명 {complete ? '완료' : '진행 중'}</b></li>
    })}</ol>
  </section>
}

function PersonalPreparation({ data, mutate }: Props) {
  const [memberId, setMemberId] = useState(data.members[0]?.id ?? '')
  const [editing, setEditing] = useState<PersonalItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const items = data.personalItems.filter((item) => item.owner_member_id === memberId)
  const done = items.filter((item) => item.is_completed).length
  const percent = progress(done, items.length)
  const categoryLabels: Record<PersonalItem['category'], string> = { essential: '기본', electronics: '전자기기', clothing: '의류·신발', toiletries: '세면·보습', medicine: '개인 의약품', other: '기타' }

  async function submit(form: HTMLFormElement) {
    const values = new FormData(form)
    const row = { trip_id: data.trip.id, owner_member_id: memberId, title: String(values.get('title')).trim(), due_date: String(values.get('due_date')) || null, category: String(values.get('category')), priority: String(values.get('priority')), is_recommended: editing?.is_recommended ?? false, is_completed: editing?.is_completed ?? false, completed_at: editing?.completed_at ?? null, sort_order: editing?.sort_order ?? items.length }
    await mutate(() => editing ? updateRow('personal_preparation_items', editing.id, row) : insertRow('personal_preparation_items', row))
    setEditing(null); setShowForm(false)
  }
  async function toggle(item: PersonalItem) { const next = !item.is_completed; await mutate(() => updateRow('personal_preparation_items', item.id, { is_completed: next, completed_at: next ? new Date().toISOString() : null })) }
  async function remove(item: PersonalItem) { if (window.confirm(`“${item.title}” 준비물을 삭제할까요?`)) await mutate(() => deleteRow('personal_preparation_items', item.id)) }

  return <>
    <div className="member-selector" role="tablist" aria-label="멤버 선택">{data.members.map((member) => <button role="tab" aria-selected={memberId === member.id} className={memberId === member.id ? 'active' : ''} key={member.id} onClick={() => { setMemberId(member.id); setEditing(null); setShowForm(false) }}>{member.name}</button>)}</div>
    <div className="recommendation-note"><strong>무엇을 챙길지 모를 때 참고하세요</strong><p>몽골 여행 후기와 9월 고비 일정을 바탕으로 만든 추천 시작 목록입니다. 본인에게 필요 없는 항목은 삭제하고 필요한 물품은 자유롭게 추가하세요.</p><a href="https://dels.tistory.com/119" target="_blank" rel="noreferrer">참고한 준비물 후기 ↗</a></div>
    <div className="subheading"><div><h3>{data.members.find((m) => m.id === memberId)?.name}의 준비물</h3><p>{done}/{items.length} 완료 · {percent}%</p></div><button onClick={() => { setEditing(null); setShowForm(!showForm) }}>+ 준비물 추가</button></div>
    {showForm && <form className="edit-form compact-form" onSubmit={(e) => { e.preventDefault(); void submit(e.currentTarget) }}><label>준비물명<input name="title" required maxLength={100} defaultValue={editing?.title} /></label><div className="form-row"><label>분류<select name="category" defaultValue={editing?.category ?? 'other'}>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>중요도<select name="priority" defaultValue={editing?.priority ?? 'optional'}><option value="required">필수</option><option value="optional">선택</option></select></label></div><label>마감일 (선택)<input name="due_date" type="date" defaultValue={editing?.due_date ?? ''} /></label><div className="form-actions"><button type="button" className="ghost" onClick={() => { setShowForm(false); setEditing(null) }}>취소</button><button>저장</button></div></form>}
    {items.length === 0 ? <div className="empty">등록된 개인 준비물이 없어요.</div> : <div className="personal-categories">{Object.entries(categoryLabels).map(([category, label]) => { const grouped = items.filter((item) => item.category === category); return grouped.length > 0 && <section key={category}><h4>{label}<span>{grouped.filter((item) => item.is_completed).length}/{grouped.length}</span></h4><div className="personal-list">{grouped.map((item) => <article className={item.is_completed ? 'personal-item done' : 'personal-item'} key={item.id}><label><input type="checkbox" checked={item.is_completed} onChange={() => void toggle(item)} /><span><b>{item.title}</b><small><i className={`priority-text ${item.priority}`}>{item.priority === 'required' ? '필수' : '선택'}</i>{item.is_recommended && ' · 추천 목록'}{item.due_date && ` · ${item.due_date}까지`}</small></span></label><div><button className="text-button" onClick={() => { setEditing(item); setShowForm(true) }}>수정</button><button className="text-button danger" onClick={() => void remove(item)}>삭제</button></div></article>)}</div></section> })}</div>}
  </>
}
