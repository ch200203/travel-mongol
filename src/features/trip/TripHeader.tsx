import { useState } from 'react'
import { updateRoles } from '../../lib/supabase/repository'
import type { TripData } from '../../lib/types'
import { isLocalMode } from '../../lib/supabase/client'

interface Props { data: TripData; mutate: (operation: () => Promise<void>) => Promise<void> }

export function TripHeader({ data, mutate }: Props) {
  const [editing, setEditing] = useState(false)
  const memberName = (id: string | null) => data.members.find((member) => member.id === id)?.name ?? '미정'
  const period = data.trip.start_date && data.trip.end_date
    ? `${data.trip.start_date} — ${data.trip.end_date}`
    : '여행 날짜 미정 · 5박 6일'

  async function submit(form: HTMLFormElement) {
    const values = new FormData(form)
    await mutate(() => updateRoles(data.trip.id, {
      leader_member_id: String(values.get('leader')) || null,
      treasurer_member_id: String(values.get('treasurer')) || null,
    }))
    setEditing(false)
  }

  return (
    <header className="trip-header">
      <div className="eyebrow">FRIENDS TRIP · MONGOLIA</div>
      <div className="trip-title-row">
        <div><h1>{data.trip.name}</h1><p>{period}</p></div>
        <button className="ghost compact" onClick={() => setEditing(!editing)} aria-expanded={editing}>역할 설정</button>
      </div>
      <div className="roles">
        <span><b>팀장</b> {memberName(data.trip.leader_member_id)}</span>
        <span><b>총무</b> {memberName(data.trip.treasurer_member_id)}</span>
        <span className="public-badge">{isLocalMode ? '이 기기에 저장' : '공개 편집'}</span>
      </div>
      <div className="trip-facts" aria-label="여행 견적 참고">
        <span><small>차량</small><strong>하이에스</strong></span>
        <span><small>1인 예약금</small><strong>21만원 · 완료</strong></span>
        <span><small>1인 현지 잔금</small><strong>95만원</strong></span>
        <span><small>1인 총액</small><strong>116만원</strong></span>
      </div>
      {editing && (
        <form className="role-form" onSubmit={(event) => { event.preventDefault(); void submit(event.currentTarget) }}>
          <label>팀장<select name="leader" defaultValue={data.trip.leader_member_id ?? ''}><option value="">미정</option>{data.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>총무<select name="treasurer" defaultValue={data.trip.treasurer_member_id ?? ''}><option value="">미정</option>{data.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <button type="submit">저장</button>
        </form>
      )}
    </header>
  )
}
