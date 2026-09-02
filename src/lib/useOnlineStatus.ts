import { useEffect, useState } from 'react'

/**
 * 고비 구간은 신호가 끊기는 곳이 많아, 화면에 보이는 값이 지금 받은 것인지
 * 캐시에서 나온 것인지 구분할 수 있어야 한다.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return online
}
