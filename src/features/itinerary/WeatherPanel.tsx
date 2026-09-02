import { useCallback, useEffect, useState } from 'react'
import { fetchTripWeather, forecastAvailable, forecastOpensOn, forecastRangeDays, weatherLabel, weatherLocations, type WeatherDay } from './weather'
import { describeFetchError, formatSavedAt, loadForecast, saveForecast } from '../../lib/forecastCache'

const cacheKey = 'trip-weather'

export function WeatherPanel() {
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** 값이 있으면 화면의 예보가 이번에 받은 것이 아니라 캐시에서 나온 것이다. */
  const [cachedAt, setCachedAt] = useState<number | null>(null)
  const available = forecastAvailable()
  const opensOn = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' }).format(forecastOpensOn())
  const pending = weatherLocations.filter((place) => !weather.some((day) => day.day === place.day))

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!available) return
    setLoading(true); setError(null)
    try {
      const fresh = await fetchTripWeather(signal)
      saveForecast(cacheKey, fresh)
      setWeather(fresh); setCachedAt(null)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      const cached = loadForecast<WeatherDay[]>(cacheKey)
      if (cached && cached.data.length > 0) {
        setWeather(cached.data); setCachedAt(cached.savedAt); setError(null)
      } else {
        setError(describeFetchError(caught, '날씨를 불러오지 못했습니다.'))
      }
    } finally { if (!signal?.aborted) setLoading(false) }
  }, [available])

  useEffect(() => {
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load])

  return <section className="weather-panel" aria-labelledby="weather-title">
    <div className="subheading weather-heading"><div><span className="eyebrow">LIVE FORECAST</span><h3 id="weather-title">여행지 날씨</h3><p>일차별 방문지 기준 · 몽골 현지 시각</p></div>{available && <button className="ghost compact" onClick={() => void load()} disabled={loading}>{loading ? '갱신 중…' : '새로고침'}</button>}</div>
    {!available ? <div className="forecast-pending"><strong>{opensOn}부터 상세 예보를 확인할 수 있어요.</strong><p>Open-Meteo의 실시간 예보 범위는 최대 {forecastRangeDays}일입니다. 이 화면은 출발일이 범위에 들어오면 자동으로 기온·강수확률·바람을 표시합니다.</p><div>{weatherLocations.map((place) => <span key={place.day}>Day {place.day}<b>{place.location}</b></span>)}</div></div>
      : error ? <div className="empty"><p>{error}</p><button onClick={() => void load()}>다시 시도</button></div>
      : loading && weather.length === 0 ? <div className="empty">최신 예보를 불러오는 중…</div>
      : <>{cachedAt !== null && <p className="stale-note">지금 예보를 받지 못해 <b>{formatSavedAt(cachedAt)}</b>에 저장해 둔 값을 보여주고 있어요.</p>}
        <div className="weather-grid">{weather.map((day) => { const condition = weatherLabel(day.code); return <article key={day.day}><header><span>Day {day.day}</span><b>{day.location}</b></header><div className="weather-main"><span aria-hidden="true">{condition.icon}</span><strong>{Math.round(day.temperatureMax)}°</strong><small>{condition.text}</small></div><p>최저 {Math.round(day.temperatureMin)}° · 비 {day.precipitationProbability}%</p><p>최대 풍속 {Math.round(day.windSpeedMax)} km/h</p></article> })}</div>
        {pending.length > 0 && <p className="astronomy-note">Day {pending.map((place) => place.day).join(', ')}은(는) 아직 16일 예보 범위 밖이라 날짜가 가까워지면 순차적으로 표시됩니다.</p>}</>}
    <a className="weather-source" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather data by Open-Meteo ↗</a>
  </section>
}
