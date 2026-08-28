import { useEffect, useState } from 'react'
import type { SkyDay } from './astronomy'
import { forecastRangeDays } from './weather'
import { routeStops } from './routeMap'

export type StarGrade = '아주 좋음' | '좋음' | '보통' | '나쁨'

export interface HourCloud { hour: number; cloudCover: number }

export interface NightSky {
  day: number
  /** 천문박명 창 전체의 평균 전운량(%). */
  cloudCover: number
  hours: HourCloud[]
  score: number
  grade: StarGrade
  note: string
}

/**
 * 보름달은 맑아도 은하수를 지운다. 구름 0·보름달이 '보통'에 걸리도록 가중치를 잡았다.
 * 광해는 점수에 넣지 않는다. 6일 내내 고비·테를지라 사실상 상수다.
 */
const MOON_WEIGHT = 50
/** 이 이하면 맨눈으로 '맑다'고 느끼는 구간. 시간대 안내의 기준이다. */
const CLEAR_THRESHOLD = 30

export function scoreNight(cloudCover: number, moonIllumination: number): number {
  return Math.max(0, Math.min(100, Math.round((100 - cloudCover) - moonIllumination * MOON_WEIGHT)))
}

export function gradeFor(score: number): StarGrade {
  if (score >= 75) return '아주 좋음'
  if (score >= 55) return '좋음'
  if (score >= 35) return '보통'
  return '나쁨'
}

/** 박명 종료~다음 날 박명 시작 사이에 완전히 들어오는 정시들. 자정을 넘어가므로 날짜가 둘로 갈린다. */
export function nightHourKeys(date: string, dusk: string, dawn: string): string[] {
  const first = Math.ceil(Number(dusk.slice(0, 2)) + Number(dusk.slice(3, 5)) / 60)
  const last = Math.floor(Number(dawn.slice(0, 2)) + Number(dawn.slice(3, 5)) / 60)
  const keys: string[] = []
  for (let hour = first; hour <= 23; hour += 1) keys.push(`${date}T${String(hour).padStart(2, '0')}:00`)
  for (let hour = 0; hour <= last; hour += 1) keys.push(`${nextDate(date)}T${String(hour).padStart(2, '0')}:00`)
  return keys
}

function nextDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10)
}

/** 맑은 시간이 가장 길게 이어지는 구간. 언제 나가면 되는지 한 줄로 알려주려고 쓴다. */
export function clearestRun(hours: HourCloud[]): { from: number; to: number } | null {
  let best: { from: number; to: number } | null = null
  let start = -1
  hours.forEach((entry, index) => {
    const clear = entry.cloudCover <= CLEAR_THRESHOLD
    if (clear && start < 0) start = index
    const ends = !clear || index === hours.length - 1
    if (start >= 0 && ends) {
      const stop = clear ? index : index - 1
      if (!best || stop - start > best.to - best.from) best = { from: start, to: stop }
      start = -1
    }
  })
  if (!best) return null
  const { from, to } = best
  return { from: hours[from].hour, to: hours[to].hour }
}

export function nightNote(hours: HourCloud[], cloudCover: number): string {
  if (hours.length === 0) return ''
  if (cloudCover <= 15) return '밤새 맑을 것으로 보여요.'
  const run = clearestRun(hours)
  if (!run) return '구름이 많아 별을 보기 어려울 수 있어요.'
  if (run.from === hours[0].hour && run.to === hours[hours.length - 1].hour) return '밤새 맑을 것으로 보여요.'
  return `${run.from}시–${run.to}시가 가장 맑아요.`
}

export function buildNightSky(sky: SkyDay, hourly: Map<string, number>): NightSky | null {
  const hours = nightHourKeys(sky.date, sky.dusk, sky.dawn).flatMap<HourCloud>((key) => {
    const cloudCover = hourly.get(key)
    return cloudCover == null ? [] : [{ hour: Number(key.slice(11, 13)), cloudCover }]
  })
  if (hours.length === 0) return null
  const cloudCover = Math.round(hours.reduce((sum, entry) => sum + entry.cloudCover, 0) / hours.length)
  const score = scoreNight(cloudCover, sky.moonIllumination)
  return { day: sky.day, cloudCover, hours, score, grade: gradeFor(score), note: nightNote(hours, cloudCover) }
}

interface CloudResponse { hourly: { time: string[]; cloud_cover: (number | null)[] } }

export async function fetchNightSkies(schedule: SkyDay[], signal?: AbortSignal): Promise<NightSky[]> {
  const query = new URLSearchParams({
    latitude: routeStops.map((stop) => stop.latitude).join(','),
    longitude: routeStops.map((stop) => stop.longitude).join(','),
    hourly: 'cloud_cover',
    timezone: 'Asia/Ulaanbaatar',
    forecast_days: String(forecastRangeDays),
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal })
  if (!response.ok) throw new Error('구름 예보를 불러오지 못했습니다.')
  const forecasts = await response.json() as CloudResponse[]
  return schedule.flatMap((sky, index) => {
    const hourly = forecasts[index]?.hourly
    if (!hourly) return []
    const lookup = new Map<string, number>()
    hourly.time.forEach((time, position) => {
      const value = hourly.cloud_cover[position]
      if (value != null) lookup.set(time, value)
    })
    const night = buildNightSky(sky, lookup)
    return night ? [night] : []
  })
}

/** 구름 예보는 6개 지점을 한 번에 받으므로 카드마다가 아니라 페이지에서 한 번만 호출한다. */
export function useNightSkies(schedule: SkyDay[]): Record<number, NightSky> {
  const [nights, setNights] = useState<Record<number, NightSky>>({})

  useEffect(() => {
    const controller = new AbortController()
    fetchNightSkies(schedule, controller.signal)
      .then((result) => setNights(Object.fromEntries(result.map((night) => [night.day, night]))))
      .catch(() => { /* 구름은 부가 정보라, 실패해도 해·달 정보는 그대로 보여준다. */ })
    return () => controller.abort()
  }, [schedule])

  return nights
}
