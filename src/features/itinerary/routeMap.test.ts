import { describe, expect, it } from 'vitest'
import { googleMapsUrl, isRoundTrip, routeBounds, routeOrigin, routePath, routeStops, totalRouteKm } from './routeMap'
import { weatherLocations } from './weather'
import { dayGuides } from './dayGuide'

describe('route map', () => {
  it('날씨 패널과 같은 좌표를 쓴다', () => {
    expect(routeStops.map((stop) => [stop.location, stop.latitude, stop.longitude]))
      .toEqual(weatherLocations.map((place) => [place.location, place.latitude, place.longitude]))
  })

  it('일차별 이동 거리와 시간을 함께 담는다', () => {
    expect(routeStops.map((stop) => stop.drivingKm)).toEqual(dayGuides.map((guide) => guide.drivingKm))
    expect(totalRouteKm).toBe(2000)
  })

  it('출발지에서 시작해 Day 순서대로 이어진다', () => {
    expect(routePath).toHaveLength(routeStops.length + 1)
    expect(routePath[0]).toEqual([routeOrigin.latitude, routeOrigin.longitude])
    expect(routePath[1]).toEqual([routeStops[0].latitude, routeStops[0].longitude])
  })

  it('울란바토르로 돌아오는 왕복 경로다', () => {
    expect(isRoundTrip()).toBe(true)
    expect(routePath[routePath.length - 1]).toEqual(routePath[0])
  })

  it('모든 지점을 감싸는 경계를 만든다', () => {
    const [[south, west], [north, east]] = routeBounds()
    for (const [latitude, longitude] of routePath) {
      expect(latitude).toBeGreaterThanOrEqual(south)
      expect(latitude).toBeLessThanOrEqual(north)
      expect(longitude).toBeGreaterThanOrEqual(west)
      expect(longitude).toBeLessThanOrEqual(east)
    }
  })

  it('구글 지도 링크에 좌표를 넣는다', () => {
    expect(googleMapsUrl({ latitude: 43.78, longitude: 102.18 }))
      .toBe('https://www.google.com/maps/search/?api=1&query=43.78,102.18')
  })
})
