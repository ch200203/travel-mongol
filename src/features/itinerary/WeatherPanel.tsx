import { useCallback, useEffect, useState } from 'react'
import { fetchTripWeather, forecastAvailable, weatherLabel, weatherLocations, type WeatherDay } from './weather'

export function WeatherPanel() {
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const available = forecastAvailable()

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!available) return
    setLoading(true); setError(null)
    try { setWeather(await fetchTripWeather(signal)) }
    catch (caught) {
      if (!(caught instanceof DOMException && caught.name === 'AbortError')) setError(caught instanceof Error ? caught.message : '날씨를 불러오지 못했습니다.')
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [available])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  return <section className="weather-panel" aria-labelledby="weather-title">
    <div className="subheading weather-heading"><div><span className="eyebrow">LIVE FORECAST</span><h3 id="weather-title">여행지 날씨</h3><p>일차별 방문지 기준 · 몽골 현지 시각</p></div>{available && <button className="ghost compact" onClick={() => void load()} disabled={loading}>{loading ? '갱신 중…' : '새로고침'}</button>}</div>
    {!available ? <div className="forecast-pending"><strong>8월 25일부터 상세 예보를 확인할 수 있어요.</strong><p>Open-Meteo의 실시간 예보 범위는 최대 16일입니다. 이 화면은 출발일이 범위에 들어오면 자동으로 기온·강수확률·바람을 표시합니다.</p><div>{weatherLocations.map((place) => <span key={place.day}>Day {place.day}<b>{place.location}</b></span>)}</div></div>
      : error ? <div className="empty"><p>{error}</p><button onClick={() => void load()}>다시 시도</button></div>
      : loading && weather.length === 0 ? <div className="empty">최신 예보를 불러오는 중…</div>
      : <div className="weather-grid">{weather.map((day) => { const condition = weatherLabel(day.code); return <article key={day.day}><header><span>Day {day.day}</span><b>{day.location}</b></header><div className="weather-main"><span aria-hidden="true">{condition.icon}</span><strong>{Math.round(day.temperatureMax)}°</strong><small>{condition.text}</small></div><p>최저 {Math.round(day.temperatureMin)}° · 비 {day.precipitationProbability}%</p><p>최대 풍속 {Math.round(day.windSpeedMax)} km/h</p></article> })}</div>}
    <a className="weather-source" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo ↗</a>
  </section>
}
