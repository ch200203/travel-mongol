import { useCallback, useEffect, useRef, useState } from 'react'
import { configurationError } from '../lib/supabase/client'
import { loadTripData, subscribeToTrip } from '../lib/supabase/repository'
import type { TripData } from '../lib/types'

export function useTripData() {
  const [data, setData] = useState<TripData | null>(null)
  const [error, setError] = useState<string | null>(configurationError)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const mounted = useRef(true)

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    try {
      const next = await loadTripData()
      if (mounted.current) { setData(next); setError(null) }
    } catch (caught) {
      if (mounted.current) setError(caught instanceof Error ? caught.message : '데이터를 불러오지 못했습니다.')
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    void refresh()
    return () => { mounted.current = false }
  }, [refresh])

  const tripId = data?.trip.id
  useEffect(() => {
    if (!tripId) return
    return subscribeToTrip(tripId, () => { void refresh(true) })
  }, [tripId, refresh])

  const mutate = useCallback(async (operation: () => Promise<void>) => {
    setSaving(true)
    setError(null)
    try {
      await operation()
      await refresh(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '저장하지 못했습니다.')
      throw caught
    } finally {
      setSaving(false)
    }
  }, [refresh])

  return { data, error, loading, saving, refresh, mutate }
}
