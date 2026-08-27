import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { googleMapsUrl, routeBounds, routePath, routeStops, totalRouteKm, type RouteStop } from './routeMap'

/** 울란바토르(Day 6)와 테를지(Day 5)는 37km라 축소 상태에서 라벨이 서로의 핀을 덮는다. 좌우로 갈라놓는다. */
const labelDirection: Record<number, 'left' | 'right' | 'top' | 'bottom'> = { 1: 'right', 2: 'bottom', 3: 'left', 4: 'top', 5: 'right', 6: 'left' }

function markerIcon(stop: RouteStop) {
  // 마지막 날은 출발지이자 도착지라 따로 표시한다.
  const origin = stop.day === routeStops.length ? ' origin' : ''
  return L.divIcon({
    className: 'route-pin-wrap',
    html: `<span class="route-pin${origin}">${stop.day}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

function popupHtml(stop: RouteStop) {
  const label = stop.day === routeStops.length ? '출발지이자 도착지 · 투어 종료' : `이동 ${stop.drivingHours}시간 · ${stop.drivingKm}km`
  return `<b>Day ${stop.day} · ${stop.location}</b><small>${stop.date}</small><small>${label}</small>`
    + `<a href="${googleMapsUrl(stop)}" target="_blank" rel="noreferrer">구글 지도에서 열기 ↗</a>`
}

export function RouteMapPanel() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<number, L.Marker>>({})
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true })
    mapRef.current = map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    L.polyline(routePath, { color: '#19382f', weight: 3, opacity: .85, dashArray: '7 6' }).addTo(map)

    for (const stop of routeStops) {
      const marker = L.marker([stop.latitude, stop.longitude], { icon: markerIcon(stop), title: `Day ${stop.day} ${stop.location}` })
        .addTo(map)
        .bindTooltip(stop.location, { permanent: true, direction: labelDirection[stop.day], className: 'route-label', offset: [0, 0] })
        .bindPopup(popupHtml(stop), { className: 'route-popup', closeButton: false })
      marker.on('popupopen', () => setActive(stop.day))
      marker.on('popupclose', () => setActive(null))
      markersRef.current[stop.day] = marker
    }

    map.fitBounds(routeBounds(), { padding: [42, 42] })
    const frame = requestAnimationFrame(() => map.invalidateSize())
    return () => { cancelAnimationFrame(frame); map.remove(); mapRef.current = null; markersRef.current = {} }
  }, [])

  function focus(stop: RouteStop) {
    const map = mapRef.current
    const marker = markersRef.current[stop.day]
    if (!map || !marker) return
    map.flyTo([stop.latitude, stop.longitude], Math.max(map.getZoom(), 7), { duration: .6 })
    marker.openPopup()
  }

  function reset() {
    const map = mapRef.current
    if (!map) return
    map.closePopup()
    map.flyToBounds(routeBounds(), { padding: [42, 42], duration: .6 })
  }

  return <section className="route-map-panel" aria-labelledby="route-map-title">
    <div className="subheading route-map-heading"><div><span className="eyebrow">ROUTE MAP</span><h3 id="route-map-title">이동 경로</h3><p>울란바토르에서 출발해 고비를 돌고 다시 울란바토르로 · 총 {totalRouteKm.toLocaleString('ko-KR')}km</p></div><button className="ghost compact" onClick={reset}>전체 보기</button></div>
    <div className="route-map" ref={containerRef} role="application" aria-label="여행 이동 경로 지도" />
    <ol className="route-legend">{routeStops.map((stop) => <li key={stop.day}>
      <button className={active === stop.day ? 'active' : undefined} onClick={() => focus(stop)}>
        <span>Day {stop.day}</span><b>{stop.location}</b><small>{stop.day === routeStops.length ? '투어 종료' : `${stop.drivingKm}km`}</small>
      </button>
    </li>)}</ol>
    <p className="astronomy-note">지도의 점선은 실제 도로가 아니라 방문 순서를 잇는 직선이에요. 고비 구간은 비포장 사막길이라 실제 주행 경로와 거리가 다를 수 있습니다.</p>
  </section>
}
