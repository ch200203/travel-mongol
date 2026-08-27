export interface WeatherDay {
  day: number
  date: string
  location: string
  code: number
  temperatureMax: number
  temperatureMin: number
  precipitationProbability: number
  windSpeedMax: number
}

/**
 * 좌표는 OpenStreetMap(Nominatim)과 위키피디아에서 확인한 실제 방문 지점 기준이다.
 * Open-Meteo는 좌표에 해당하는 90m 수치표고모델로 기온을 자동 보정하므로 elevation은 넘기지 않는다.
 */
export const weatherLocations = [
  // OSM monument node '차강소브라가' (Өлзийт, Дундговь)
  { day: 1, date: '2026-09-09', location: '차강소브라가', latitude: 44.58, longitude: 105.72 },
  // 위키피디아 43°29′35″N 104°05′02″E, OSM 트레일 시작점과 일치
  { day: 2, date: '2026-09-10', location: '욜링암', latitude: 43.49, longitude: 104.08 },
  // 사구가 동서로 길어 관광 전망대·캠프가 모인 서쪽 구간 기준
  { day: 3, date: '2026-09-11', location: '홍고린엘스', latitude: 43.78, longitude: 102.18 },
  // 위키피디아 Flaming Cliffs 44°08′19″N 103°43′40″E
  { day: 4, date: '2026-09-12', location: '바양작', latitude: 44.14, longitude: 103.73 },
  // 공원 전체가 아니라 Day 5 일정지인 거북바위(Мэлхий хад)·아리야발 사원 일대.
  // 107.43은 능선(1707m)에 걸려 기온이 낮게 보정되므로 캠프가 있는 계곡 바닥(1529m)을 쓴다.
  { day: 5, date: '2026-09-13', location: '테를지', latitude: 47.91, longitude: 107.42 },
  { day: 6, date: '2026-09-14', location: '울란바토르', latitude: 47.92, longitude: 106.92 },
]

interface ForecastResponse {
  daily: {
    time: string[]
    weather_code: (number | null)[]
    temperature_2m_max: (number | null)[]
    temperature_2m_min: (number | null)[]
    precipitation_probability_max: (number | null)[]
    wind_speed_10m_max: (number | null)[]
  }
}

/** Open-Meteo 무료 예보는 오늘 포함 최대 16일까지만 제공한다. */
export const forecastRangeDays = 16

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function forecastHorizon(today = new Date()): string {
  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + forecastRangeDays - 1)
  return toIsoDate(horizon)
}

export function forecastAvailable(today = new Date()): boolean {
  const horizon = forecastHorizon(today)
  return weatherLocations.some((place) => place.date <= horizon)
}

export async function fetchTripWeather(signal?: AbortSignal): Promise<WeatherDay[]> {
  const latitude = weatherLocations.map((place) => place.latitude).join(',')
  const longitude = weatherLocations.map((place) => place.longitude).join(',')
  const query = new URLSearchParams({
    latitude,
    longitude,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'Asia/Ulaanbaatar',
    forecast_days: String(forecastRangeDays),
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal })
  if (!response.ok) throw new Error('날씨 예보를 불러오지 못했습니다.')
  const forecasts = await response.json() as ForecastResponse[]
  const days = weatherLocations.flatMap<WeatherDay>((place, index) => {
    const daily = forecasts[index]?.daily
    const dateIndex = daily?.time.indexOf(place.date) ?? -1
    if (!daily || dateIndex < 0) return []
    // 범위 마지막 날은 날짜만 있고 값이 비어 오는 경우가 있어 대기 상태로 남긴다.
    const code = daily.weather_code[dateIndex]
    const temperatureMax = daily.temperature_2m_max[dateIndex]
    const temperatureMin = daily.temperature_2m_min[dateIndex]
    const windSpeedMax = daily.wind_speed_10m_max[dateIndex]
    if (code == null || temperatureMax == null || temperatureMin == null || windSpeedMax == null) return []
    return [{
      day: place.day,
      date: place.date,
      location: place.location,
      code,
      temperatureMax,
      temperatureMin,
      precipitationProbability: daily.precipitation_probability_max[dateIndex] ?? 0,
      windSpeedMax,
    }]
  })
  if (days.length === 0) throw new Error('여행 날짜의 예보가 아직 제공되지 않습니다.')
  return days
}

export function weatherLabel(code: number): { icon: string; text: string } {
  if (code === 0) return { icon: '☀️', text: '맑음' }
  if (code <= 3) return { icon: '⛅', text: '구름' }
  if (code <= 48) return { icon: '🌫️', text: '안개' }
  if (code <= 67) return { icon: '🌧️', text: '비' }
  if (code <= 77) return { icon: '🌨️', text: '눈' }
  if (code <= 82) return { icon: '🌦️', text: '소나기' }
  if (code <= 86) return { icon: '❄️', text: '눈보라' }
  return { icon: '⛈️', text: '뇌우' }
}
