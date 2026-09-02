import { useEffect, useState } from 'react'

const dismissedKey = 'mongolia-friends-trip:install-banner-dismissed'

/** 안드로이드/크롬은 설치 가능해지면 이 이벤트를 던진다. iOS Safari는 던지지 않는다. */
interface InstallPromptEvent extends Event {
  prompt?: () => Promise<void>
}

/**
 * beforeinstallprompt는 React가 마운트되기 전에 날아올 수 있다. 컴포넌트 안에서 듣기 시작하면
 * 이미 지나간 이벤트를 놓쳐 배너가 영영 뜨지 않으므로, 모듈이 평가될 때 바로 받아 둔다.
 */
let capturedPrompt: InstallPromptEvent | null = null
const subscribers = new Set<(event: InstallPromptEvent) => void>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // 기본 미니 인포바를 막고 우리 배너에서 같은 프롬프트를 띄운다.
    event.preventDefault()
    capturedPrompt = event as InstallPromptEvent
    for (const notify of subscribers) notify(capturedPrompt)
  })
}

/** 홈 화면에서 실행 중이면 이미 설치된 것이므로 안내할 것이 없다. */
function alreadyInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari는 display-mode 대신 비표준 navigator.standalone으로 알려준다.
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

/**
 * iOS는 설치를 코드로 띄울 수 없고 공유 시트를 거쳐야 한다.
 * 안내 문구가 실제 화면과 맞아야 하므로 Safari에만 보여준다.
 */
function isIosSafari(): boolean {
  const ua = navigator.userAgent
  const ios = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  return ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function wasDismissed(): boolean {
  try {
    return localStorage.getItem(dismissedKey) === '1'
  } catch {
    return false
  }
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(capturedPrompt)
  const [hidden, setHidden] = useState(() => wasDismissed() || alreadyInstalled())
  const iosHint = !promptEvent && isIosSafari()

  useEffect(() => {
    subscribers.add(setPromptEvent)
    const onInstalled = () => setHidden(true)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      subscribers.delete(setPromptEvent)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // 하단 고정 배너가 마지막 콘텐츠를 덮으므로, 떠 있는 동안만 페이지 아래 여백을 넓힌다.
  const visible = !hidden && (promptEvent !== null || iosHint)
  useEffect(() => {
    document.body.classList.toggle('has-install-banner', visible)
    return () => document.body.classList.remove('has-install-banner')
  }, [visible])

  function dismiss() {
    setHidden(true)
    try {
      localStorage.setItem(dismissedKey, '1')
    } catch {
      // 저장에 실패하면 이번 세션만 숨긴다.
    }
  }

  async function install() {
    await promptEvent?.prompt?.()
    setHidden(true)
  }

  if (!visible) return null

  return <aside className="install-banner" role="complementary" aria-label="홈 화면에 추가 안내">
    <div>
      <strong>홈 화면에 추가해 두세요</strong>
      {promptEvent
        ? <p>앱처럼 바로 열리고, 저장한 일정과 정산이 오래 남아요.</p>
        : <p>Safari 아래쪽 <b>공유 버튼</b>을 누르고 <b>홈 화면에 추가</b>를 선택하세요. 그냥 두는 것보다 저장한 일정과 정산이 오래 남아요.</p>}
    </div>
    <div className="install-banner-actions">
      {promptEvent && <button onClick={() => void install()}>설치</button>}
      <button className="ghost compact" onClick={dismiss}>닫기</button>
    </div>
  </aside>
}
