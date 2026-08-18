import { useState } from 'react'
import { deleteRow, insertRow, updateRow } from '../../lib/supabase/repository'
import type { ItineraryItem, TripData } from '../../lib/types'
import { dateForDay } from '../../lib/tripLogic'
import { FlightPanel } from './FlightPanel'
import { WeatherPanel } from './WeatherPanel'
import { AstronomyDayCard } from './AstronomyPanel'
import { buildSkySchedule } from './astronomy'
import { dayGuides, lodgingCaution, totalDriving, type DayGuide } from './dayGuide'

interface Props { data: TripData; mutate: (operation: () => Promise<void>) => Promise<void> }

function actualDate(startDate: string | null, day: number) {
  const date = dateForDay(startDate, day)
  if (!date) return null
  return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date)
}

export function ItineraryPage({ data, mutate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ItineraryItem | null>(null)
  const skySchedule = buildSkySchedule(data.trip.start_date)

  async function submit(form: HTMLFormElement) {
    const values = new FormData(form)
    const row = {
      trip_id: data.trip.id,
      title: String(values.get('title')).trim(),
      day_number: Number(values.get('day_number')),
      start_time: String(values.get('start_time')) || null,
      end_time: String(values.get('end_time')) || null,
      location: String(values.get('location')).trim() || null,
      note: String(values.get('note')).trim() || null,
      link_url: String(values.get('link_url')).trim() || null,
      status: String(values.get('status')),
      source: editing?.source ?? 'manual',
      sort_order: editing?.sort_order ?? data.itinerary.length,
    }
    await mutate(() => editing ? updateRow('itinerary_items', editing.id, row) : insertRow('itinerary_items', row))
    setEditing(null); setShowForm(false)
  }
  async function remove(item: ItineraryItem) { if (window.confirm(`“${item.title}” 일정을 삭제할까요?`)) await mutate(() => deleteRow('itinerary_items', item.id)) }
  const beginEdit = (item: ItineraryItem) => { setEditing(item); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <section>
    <div className="section-heading"><div><span className="eyebrow">5 NIGHTS · 6 DAYS</span><h2>여행 일정</h2><p>{data.trip.start_date ? '여행 시작일을 기준으로 날짜를 표시해요.' : '출발일이 정해지면 실제 날짜가 자동으로 표시돼요.'}</p></div><button onClick={() => { setEditing(null); setShowForm(!showForm) }}>+ 일정 추가</button></div>
    <FlightPanel />
    <section className="route-summary" aria-labelledby="route-summary-title">
      <div><span className="eyebrow">ROAD TRIP</span><h3 id="route-summary-title">고비사막부터 테를지까지</h3><p>견적서 기준 예상 차량 이동량이에요. 현지 도로와 기상 상황에 따라 달라질 수 있어요.</p></div>
      <dl><div><dt>총 이동</dt><dd>{totalDriving.hours}시간</dd></div><div><dt>총 거리</dt><dd>{totalDriving.km.toLocaleString('ko-KR')}km</dd></div><div><dt>숙박</dt><dd>여행자 캠프 5박</dd></div></dl>
    </section>
    <details className="tour-operator">
      <summary><span>투어사 정보</span><strong>여나투어</strong></summary>
      <div><p>견적 및 현지 일정 관련 문의가 필요할 때 이용하세요.</p><nav aria-label="여나투어 연락처"><a href="https://www.yeonatour.com/" target="_blank" rel="noreferrer">홈페이지 ↗</a><a href="https://pf.kakao.com/_TxnGHG/chat" target="_blank" rel="noreferrer">카카오채널 상담 ↗</a></nav></div>
    </details>
    <WeatherPanel />
    {showForm && <ItineraryForm item={editing} onSubmit={submit} onCancel={() => { setShowForm(false); setEditing(null) }} />}
    <div className="timeline">{[1, 2, 3, 4, 5, 6].map((day) => {
      const items = data.itinerary.filter((item) => item.day_number === day)
      const guide = dayGuides[day - 1]
      return <section className="day-group" key={day}>
        <header><span>DAY</span><strong>{day}</strong><p>{actualDate(data.trip.start_date, day) ?? '날짜 미정'}</p></header>
        <div className="day-items"><DayGuideCard guide={guide} />{items.length === 0 ? <div className="empty small">등록된 일정이 없어요.</div> : items.map((item) => <article className={`schedule-item${item.status === 'cancelled' ? ' cancelled' : ''}`} key={item.id}>
          <time>{item.start_time?.slice(0, 5) ?? '시간 미정'}{item.end_time && <small>— {item.end_time.slice(0, 5)}</small>}</time>
          <div><span className={`status ${item.status}`}>{item.status === 'confirmed' ? '확정' : item.status === 'cancelled' ? '취소' : '제안'}</span><h3>{item.title}</h3>{item.location && <p>⌖ {item.location}</p>}{item.note && <p className="note">{item.note}</p>}{item.link_url && <a href={item.link_url} target="_blank" rel="noreferrer">관련 링크 ↗</a>}</div>
          <div className="schedule-actions"><button className="text-button" onClick={() => beginEdit(item)}>수정</button><button className="text-button danger" onClick={() => void remove(item)}>삭제</button></div>
        </article>)}<AstronomyDayCard day={skySchedule[day - 1]} /></div>
      </section>
    })}</div>
    <p className="astronomy-note">별 관측 시간은 태양이 지평선 아래 18°로 내려간 천문박명 종료부터 다음 날 천문박명 시작까지예요. 산·지형·구름에 따라 실제 관측 조건은 달라질 수 있습니다. <a href="https://gml.noaa.gov/grad/solcalc/calcdetails.html" target="_blank" rel="noreferrer">계산 기준: NOAA Solar Calculator ↗</a></p>
  </section>
}

function DayGuideCard({ guide }: { guide: DayGuide }) {
  return <article className="day-guide-card">
    <header>
      <div><span>오늘의 루트</span><h3>{guide.destination}</h3></div>
      <strong>차량 이동 {guide.drivingHours}시간 · {guide.drivingKm}km</strong>
    </header>
    <div className="day-guide-grid">
      <section aria-label="식사 안내"><h4>식사</h4><dl className="meal-list"><div><dt>아침</dt><dd>{guide.meals.breakfast}</dd></div><div><dt>점심</dt><dd>{guide.meals.lunch}</dd></div><div><dt>저녁</dt><dd>{guide.meals.dinner}</dd></div></dl></section>
      <section className="lodging-summary" aria-label="숙소 안내"><h4>숙소</h4>{guide.lodging ? <><strong>{guide.lodging.name}</strong><div className="amenity-list">{guide.lodging.amenities.map((amenity) => <span key={amenity}>✓ {amenity}</span>)}</div></> : <><strong>투어 숙박 없음</strong><p>시내 투어와 공항 샌딩 후 일정이 종료돼요.</p></>}</section>
    </div>
    <div className="highlight-list" aria-label="가능한 체험과 참고사항">{guide.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}</div>
    {guide.lodging && <details className="lodging-details"><summary>숙소 특징과 배정 후보 보기</summary><div><ul>{guide.lodging.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><p><b>기본 숙소 후보</b>{guide.lodging.candidates.join(' · ')}</p><p><b>업그레이드 선택지</b>{guide.lodging.upgrades.join(' · ')}</p><small>{lodgingCaution}</small></div></details>}
  </article>
}

function ItineraryForm({ item, onSubmit, onCancel }: { item: ItineraryItem | null; onSubmit: (form: HTMLFormElement) => Promise<void>; onCancel: () => void }) {
  return <form className="edit-form" onSubmit={(e) => { e.preventDefault(); void onSubmit(e.currentTarget) }}>
    <h3>{item ? '일정 수정' : '새 일정'}</h3>
    <label>일정 제목<input name="title" required maxLength={100} defaultValue={item?.title} /></label>
    <div className="form-row"><label>일차<select name="day_number" defaultValue={item?.day_number ?? 1}>{[1, 2, 3, 4, 5, 6].map((day) => <option key={day} value={day}>Day {day}</option>)}</select></label><label>상태<select name="status" defaultValue={item?.status ?? 'proposed'}><option value="proposed">제안</option><option value="confirmed">확정</option><option value="cancelled">취소</option></select></label></div>
    <div className="form-row"><label>시작 시각<input name="start_time" type="time" defaultValue={item?.start_time?.slice(0, 5) ?? ''} /></label><label>종료 시각<input name="end_time" type="time" defaultValue={item?.end_time?.slice(0, 5) ?? ''} /></label></div>
    <label>장소<input name="location" maxLength={200} defaultValue={item?.location ?? ''} /></label>
    <label>관련 링크<input name="link_url" type="url" maxLength={2048} placeholder="https://" defaultValue={item?.link_url ?? ''} /></label>
    <label>메모<textarea name="note" maxLength={1000} defaultValue={item?.note ?? ''} /></label>
    <div className="form-actions"><button type="button" className="ghost" onClick={onCancel}>취소</button><button>저장</button></div>
  </form>
}
