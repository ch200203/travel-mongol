import type { SkyDay } from './astronomy'
import type { NightSky, StarGrade } from './stargazing'

const gradeClass: Record<StarGrade, string> = { '아주 좋음': 'best', '좋음': 'good', '보통': 'fair', '나쁨': 'poor' }

function CloudBars({ night }: { night: NightSky }) {
  return <div className="cloud-bars">
    <div className="cloud-bar-row" role="img" aria-label={`시간대별 구름량: ${night.hours.map((entry) => `${entry.hour}시 ${entry.cloudCover}%`).join(', ')}`}>
      {night.hours.map((entry) => <span key={entry.hour} title={`${entry.hour}시 · 구름 ${entry.cloudCover}%`}>
        <i><b style={{ height: `${entry.cloudCover}%` }} /></i>
        <small>{entry.hour}</small>
      </span>)}
    </div>
    <p className="cloud-note">{night.note}</p>
  </div>
}

export function AstronomyDayCard({ day, night }: { day: SkyDay; night?: NightSky }) {
  return <details className="astronomy-card" aria-label={`Day ${day.day} 해와 별 관측 시간`} open>
      <summary><span>☀ SUN & STARS</span><b>{day.location} · 몽골 현지 시각</b><small>접기</small></summary>
      <div className="astronomy-content">
      <div className="sun-times">
        <span><i aria-hidden="true">☀️</i><small>일출</small><strong>{day.sunrise}</strong></span>
        <span><i aria-hidden="true">🌇</i><small>일몰</small><strong>{day.sunset}</strong></span>
      </div>
      <div className="star-window"><span>✦ 별 보기 좋은 시간</span><strong>{day.starWindow}</strong></div>
      {night && <p className={`star-grade ${gradeClass[night.grade]}`}><b>관측 {night.grade}</b><small>밤 구름 {night.cloudCover}%</small></p>}
      <p>🌙 {day.moonLabel} · 달 밝기 {Math.round(day.moonIllumination * 100)}%</p>
      <small>{day.viewingNote}</small>
      {night && <CloudBars night={night} />}
    </div>
  </details>
}
