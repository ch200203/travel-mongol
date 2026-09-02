import { dateForDay } from '../../lib/tripLogic'
import { dayGuides } from '../itinerary/dayGuide'
import type { TripData } from '../../lib/types'

export function AlbumPage({ data }: { data: TripData }) {
  return <section>
    <div className="section-heading"><div><span className="eyebrow">TRIP MEMORIES</span><h2>여행 앨범</h2><p>일정과 사진을 Day별로 함께 돌아볼 공간이에요.</p></div><span className="coming-badge">추후 제공</span></div>
    <div className="album-notice"><strong>사진 업로드 기능을 준비하고 있어요</strong><p>향후 각 사진을 일정 항목과 연결하고, 촬영 날짜·장소·메모를 함께 볼 수 있도록 확장할 예정입니다.</p></div>
    <div className="album-days">{[1, 2, 3, 4, 5, 6].map((day) => {
      const date = dateForDay(data.trip.start_date, day)
      // source로 거르면 로컬 시드(전부 manual)에서 0건이 되므로 취소된 일정만 뺀다.
      const schedules = data.itinerary.filter((item) => item.day_number === day && item.status !== 'cancelled')
      return <article key={day}>
        <div className="album-placeholder" aria-label={`Day ${day} 사진 자리`}><span>＋</span><small>사진이 들어갈 자리</small></div>
        <div><span>DAY {day}</span><h3>{dayGuides[day - 1]?.destination ?? '자유 일정'}</h3><p>{date ? new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(date) : '날짜 미정'} · 일정 {schedules.length}개</p></div>
      </article>
    })}</div>
  </section>
}
