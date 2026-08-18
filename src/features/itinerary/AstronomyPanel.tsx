import type { SkyDay } from './astronomy'

export function AstronomyDayCard({ day }: { day: SkyDay }) {
  return <details className="astronomy-card" aria-label={`Day ${day.day} 해와 별 관측 시간`} open>
      <summary><span>☀ SUN & STARS</span><b>{day.location} · 몽골 현지 시각</b><small>접기</small></summary>
      <div className="astronomy-content">
      <div className="sun-times">
        <span><i aria-hidden="true">☀️</i><small>일출</small><strong>{day.sunrise}</strong></span>
        <span><i aria-hidden="true">🌇</i><small>일몰</small><strong>{day.sunset}</strong></span>
      </div>
      <div className="star-window"><span>✦ 별 보기 좋은 시간</span><strong>{day.starWindow}</strong></div>
      <p>🌙 {day.moonLabel} · 달 밝기 {Math.round(day.moonIllumination * 100)}%</p>
      <small>{day.viewingNote}</small>
      </div>
  </details>
}
