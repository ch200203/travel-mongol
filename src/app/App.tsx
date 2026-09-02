import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { ExpensesPage } from '../features/expenses/ExpensesPage'
import { PreparationPage } from '../features/preparation/PreparationPage'
import { ItineraryPage } from '../features/itinerary/ItineraryPage'
import { TripHeader } from '../features/trip/TripHeader'
import { AlbumPage } from '../features/album/AlbumPage'
import { GuidePage } from '../features/guide/GuidePage'
import { InstallBanner } from '../features/pwa/InstallBanner'
import { useTripData } from './useTripData'

const tabs = [
  ['/itinerary', '일정', '⌖'],
  ['/preparation', '준비물', '✓'],
  ['/expenses', '정산', '₩'],
  ['/album', '앨범', '▧'],
  ['/guide', '안내', 'ⓘ'],
]

export function App() {
  const state = useTripData()
  const { data, error, loading, saving } = state

  if (loading && !data) return <main className="center-state"><span className="spinner" />여행 정보를 불러오는 중…</main>

  if (!data) return (
    <main className="center-state error-panel">
      <strong>여행 정보를 열 수 없어요</strong>
      <p>{error}</p>
      <button onClick={() => void state.refresh()}>다시 시도</button>
    </main>
  )

  return (
    <div className="app-shell">
      <TripHeader data={data} mutate={state.mutate} />
      {error && <div className="toast error" role="alert">{error}</div>}
      {saving && <div className="save-state" role="status">저장 중…</div>}
      <nav className="tab-bar" aria-label="주요 메뉴">
        {tabs.map(([to, label, icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span aria-hidden="true">{icon}</span>{label}
          </NavLink>
        ))}
      </nav>
      <main className="page">
        <Routes>
          <Route path="/expenses" element={<ExpensesPage data={data} mutate={state.mutate} />} />
          <Route path="/preparation" element={<PreparationPage data={data} mutate={state.mutate} />} />
          <Route path="/itinerary" element={<ItineraryPage data={data} mutate={state.mutate} />} />
          <Route path="/album" element={<AlbumPage data={data} />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="*" element={<Navigate to="/itinerary" replace />} />
        </Routes>
      </main>
      <InstallBanner />
    </div>
  )
}
