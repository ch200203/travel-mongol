import { dayGuides } from './dayGuide'
import { weatherLocations } from './weather'

export interface RouteStop {
  day: number
  date: string
  location: string
  latitude: number
  longitude: number
  drivingHours: number
  drivingKm: number
}

/** 투어는 울란바토르에서 출발해 Day 6에 다시 울란바토르로 돌아온다. */
export const routeOrigin = { location: '울란바토르', latitude: 47.92, longitude: 106.92 }

/**
 * 지도에 찍는 지점은 날씨 패널과 같은 좌표를 쓴다.
 * 좌표는 OSM에서 확인한 실제 방문 지점이라 두 화면이 어긋나지 않도록 한 곳에서만 관리한다.
 */
export const routeStops: RouteStop[] = weatherLocations.map((place) => {
  const guide = dayGuides[place.day - 1]
  return { ...place, drivingHours: guide.drivingHours, drivingKm: guide.drivingKm }
})

/** 출발지에서 시작해 일차 순서대로 이어지는 이동 경로. Day 6이 울란바토르라 경로는 원점으로 닫힌다. */
export const routePath: [number, number][] = [
  [routeOrigin.latitude, routeOrigin.longitude],
  ...routeStops.map((stop): [number, number] => [stop.latitude, stop.longitude]),
]

export function isRoundTrip(): boolean {
  const last = routeStops[routeStops.length - 1]
  return last.latitude === routeOrigin.latitude && last.longitude === routeOrigin.longitude
}

/** 지도를 처음 열었을 때 모든 지점이 들어오도록 잡는 경계 상자. */
export function routeBounds(): [[number, number], [number, number]] {
  const latitudes = routePath.map(([latitude]) => latitude)
  const longitudes = routePath.map(([, longitude]) => longitude)
  return [[Math.min(...latitudes), Math.min(...longitudes)], [Math.max(...latitudes), Math.max(...longitudes)]]
}

export function googleMapsUrl(stop: Pick<RouteStop, 'latitude' | 'longitude'>): string {
  return `https://www.google.com/maps/search/?api=1&query=${stop.latitude},${stop.longitude}`
}

export const totalRouteKm = routeStops.reduce((sum, stop) => sum + stop.drivingKm, 0)
