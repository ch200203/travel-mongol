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

export const weatherLocations = [
  { day: 1, date: '2026-09-09', location: '차강소브라가', latitude: 44.57, longitude: 105.75 },
  { day: 2, date: '2026-09-10', location: '욜링암', latitude: 43.47, longitude: 104.08 },
  { day: 3, date: '2026-09-11', location: '홍고린엘스', latitude: 43.75, longitude: 102.27 },
  { day: 4, date: '2026-09-12', location: '바양작', latitude: 44.14, longitude: 103.72 },
  { day: 5, date: '2026-09-13', location: '테를지', latitude: 47.99, longitude: 107.46 },
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
