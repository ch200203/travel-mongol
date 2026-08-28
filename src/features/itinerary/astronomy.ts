import { weatherLocations } from './weather'

const DAY_MS = 86_400_000
const MINUTES_PER_DAY = 1_440
const MONGOLIA_UTC_OFFSET_MINUTES = 8 * 60
const SYNODIC_MONTH_DAYS = 29.53058867
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14)

export interface SkyDay {
  day: number
  date: string
  location: string
  sunrise: string
  sunset: string
  /** 천문박명 종료(관측 시작). starWindow는 표시용이고 계산에는 이 값을 쓴다. */
  dusk: string
  /** 다음 날 천문박명 시작(관측 종료). */
  dawn: string
  starWindow: string
  moonIllumination: number
  moonLabel: string
  viewingNote: string
}

function radians(degrees: number) { return degrees * Math.PI / 180 }
function degrees(radiansValue: number) { return radiansValue * 180 / Math.PI }
function normalizedDegrees(value: number) { return ((value % 360) + 360) % 360 }

function julianDay(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / DAY_MS + 2440587.5
}

function julianCentury(julian: number) { return (julian - 2451545) / 36525 }

function solarCoordinates(century: number) {
  const meanLongitude = normalizedDegrees(280.46646 + century * (36000.76983 + century * 0.0003032))
  const meanAnomaly = 357.52911 + century * (35999.05029 - 0.0001537 * century)
  const eccentricity = 0.016708634 - century * (0.000042037 + 0.0000001267 * century)
  const anomalyRadians = radians(meanAnomaly)
  const equationOfCenter = Math.sin(anomalyRadians) * (1.914602 - century * (0.004817 + 0.000014 * century))
    + Math.sin(2 * anomalyRadians) * (0.019993 - 0.000101 * century)
    + Math.sin(3 * anomalyRadians) * 0.000289
  const trueLongitude = meanLongitude + equationOfCenter
  const omega = 125.04 - 1934.136 * century
  const apparentLongitude = trueLongitude - 0.00569 - 0.00478 * Math.sin(radians(omega))
  const meanObliquity = 23 + (26 + (21.448 - century * (46.815 + century * (0.00059 - century * 0.001813))) / 60) / 60
  const obliquity = meanObliquity + 0.00256 * Math.cos(radians(omega))
  const declination = degrees(Math.asin(Math.sin(radians(obliquity)) * Math.sin(radians(apparentLongitude))))
  const y = Math.tan(radians(obliquity) / 2) ** 2
  const equationOfTime = 4 * degrees(
    y * Math.sin(2 * radians(meanLongitude))
    - 2 * eccentricity * Math.sin(anomalyRadians)
    + 4 * eccentricity * y * Math.sin(anomalyRadians) * Math.cos(2 * radians(meanLongitude))
    - 0.5 * y * y * Math.sin(4 * radians(meanLongitude))
    - 1.25 * eccentricity * eccentricity * Math.sin(2 * anomalyRadians),
  )
  return { declination, equationOfTime }
}

function solarEventUtcMinutes(date: string, latitude: number, longitude: number, zenith: number, rising: boolean): number {
  const julian = julianDay(date)
  let minutes = 720 - 4 * longitude

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const { declination, equationOfTime } = solarCoordinates(julianCentury(julian + minutes / MINUTES_PER_DAY))
    const cosineHourAngle = (
      Math.cos(radians(zenith)) / (Math.cos(radians(latitude)) * Math.cos(radians(declination)))
      - Math.tan(radians(latitude)) * Math.tan(radians(declination))
    )
    if (cosineHourAngle < -1 || cosineHourAngle > 1) throw new Error('이 날짜와 위치에서는 태양 시각을 계산할 수 없습니다.')
    const hourAngle = degrees(Math.acos(cosineHourAngle))
    minutes = 720 - 4 * (longitude + (rising ? hourAngle : -hourAngle)) - equationOfTime
  }
  return minutes
}

function localTime(utcMinutes: number): string {
  const total = Math.round(utcMinutes + MONGOLIA_UTC_OFFSET_MINUTES)
  const normalized = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10)
}

export function moonForDate(date: string): Pick<SkyDay, 'moonIllumination' | 'moonLabel' | 'viewingNote'> {
  const observationTime = new Date(`${date}T14:00:00Z`).getTime()
  const elapsedDays = (observationTime - KNOWN_NEW_MOON_UTC) / DAY_MS
  const phase = ((elapsedDays / SYNODIC_MONTH_DAYS) % 1 + 1) % 1
  const moonIllumination = (1 - Math.cos(2 * Math.PI * phase)) / 2

  let moonLabel = '삭 무렵'
  if (phase < 0.03 || phase >= 0.97) moonLabel = '삭 무렵'
  else if (phase < 0.22) moonLabel = '초승달'
  else if (phase < 0.28) moonLabel = '상현달'
  else if (phase < 0.47) moonLabel = '차오르는 달'
  else if (phase < 0.53) moonLabel = '보름달'
  else if (phase < 0.72) moonLabel = '기우는 달'
  else if (phase < 0.78) moonLabel = '하현달'
  else if (phase < 0.97) moonLabel = '그믐달'

  const viewingNote = moonIllumination <= 0.25
    ? '달빛이 적어 별 보기 좋은 시기'
    : moonIllumination <= 0.65 ? '달을 등지고 어두운 곳에서 관측 추천' : '달빛이 강해 희미한 별은 보기 어려울 수 있음'
  return { moonIllumination, moonLabel, viewingNote }
}

export function buildSkySchedule(startDate: string | null): SkyDay[] {
  return weatherLocations.map((place) => {
    const date = startDate ? addDays(startDate, place.day - 1) : place.date
    const nextDate = addDays(date, 1)
    const sunrise = localTime(solarEventUtcMinutes(date, place.latitude, place.longitude, 90.833, true))
    const sunset = localTime(solarEventUtcMinutes(date, place.latitude, place.longitude, 90.833, false))
    const astronomicalDusk = localTime(solarEventUtcMinutes(date, place.latitude, place.longitude, 108, false))
    const astronomicalDawn = localTime(solarEventUtcMinutes(nextDate, place.latitude, place.longitude, 108, true))
    return {
      day: place.day,
      date,
      location: place.location,
      sunrise,
      sunset,
      dusk: astronomicalDusk,
      dawn: astronomicalDawn,
      starWindow: `${astronomicalDusk}–${astronomicalDawn}`,
      ...moonForDate(date),
    }
  })
}
