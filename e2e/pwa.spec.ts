import { expect, test } from '@playwright/test'

/** 서비스워커가 설치를 끝내고 활성화될 때까지 기다린다. 활성화 시점이면 프리캐시도 끝나 있다. */
async function serviceWorkerReady(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, { timeout: 15_000 })
}

test('홈 화면에 추가할 수 있는 매니페스트를 제공한다', async ({ page, request }) => {
  await page.goto('/itinerary')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBe('/manifest.webmanifest')

  const manifest = await (await request.get(href!)).json()
  expect(manifest.name).toBe('별고비팀 · 고비사막+테를지 5박 6일')
  expect(manifest.short_name).toBe('별고비팀')
  expect(manifest.display).toBe('standalone')
  expect(manifest.theme_color).toBe('#19382f')
  // 안드로이드 홈 화면 아이콘이 잘리지 않으려면 maskable이 하나는 있어야 한다.
  expect(manifest.icons.some((icon: { purpose?: string }) => icon.purpose === 'maskable')).toBe(true)

  for (const icon of manifest.icons) {
    expect((await request.get(`/${icon.src}`)).status()).toBe(200)
  }
  expect((await request.get('/icons/apple-touch-icon.png')).status()).toBe(200)
})

test('오프라인에서도 일정과 준비물이 그대로 열린다', async ({ page, context }) => {
  await page.goto('/itinerary')
  await serviceWorkerReady(page)

  await context.setOffline(true)
  await page.reload()

  // 일정은 번들과 localStorage에만 기대므로 네트워크 없이 그대로 나와야 한다.
  await expect(page.getByRole('heading', { name: '별고비팀 세부 일정' })).toBeVisible()
  await expect(page.locator('.day-guide-card').first().getByRole('heading', { name: '차강소브라가' })).toBeVisible()
  // 여기서 오프라인 배지는 확인하지 않는다. Playwright의 오프라인 에뮬레이션은 새로 연 문서에서
  // navigator.onLine을 다시 true로 돌려주기 때문이다. 배지는 아래 연결 상태 테스트가 맡는다.

  // 탭 이동도 셸이 캐시돼 있으니 끊기지 않는다.
  await page.getByRole('link', { name: /준비물/ }).click()
  await expect(page.getByRole('heading', { name: '출발 전 반드시 확인' })).toBeVisible()
  await page.getByRole('link', { name: /안내/ }).click()
  await expect(page.getByText('숙소 전기와 샤워 시간')).toBeVisible()

  await context.setOffline(false)
})

test('온라인으로 돌아오면 오프라인 배지가 사라진다', async ({ page, context }) => {
  await page.goto('/itinerary')
  await expect(page.getByText('오프라인', { exact: true })).toHaveCount(0)

  await context.setOffline(true)
  await expect(page.getByText('오프라인', { exact: true })).toBeVisible()

  await context.setOffline(false)
  await expect(page.getByText('오프라인', { exact: true })).toHaveCount(0)
})

test('오프라인이면 마지막으로 받은 예보를 출처와 함께 보여준다', async ({ page, context }) => {
  // 먼저 온라인에서 예보를 한 번 받아 캐시를 채운다.
  await page.goto('/itinerary')
  await serviceWorkerReady(page)
  await expect(page.locator('.weather-grid article').first()).toBeVisible({ timeout: 15_000 })

  await context.setOffline(true)
  await page.reload()

  const panel = page.locator('.weather-panel')
  // 캐시가 있으므로 에러가 아니라 예보가 그대로 나와야 한다.
  await expect(panel.locator('.weather-grid article').first()).toBeVisible()
  await expect(panel.locator('.stale-note')).toContainText('저장해 둔 값을 보여주고 있어요')
  // 브라우저 영문 오류가 사용자에게 새어 나가지 않는다.
  await expect(page.getByText('Failed to fetch')).toHaveCount(0)

  await context.setOffline(false)
})

test('캐시가 없는 채로 오프라인이면 한국어 안내를 보여준다', async ({ page, context }) => {
  // 한 번도 온라인으로 연 적 없으면 서비스워커가 없어 앱 자체가 열리지 않는다.
  // 그래서 셸은 받아두고 예보 캐시만 비운 상태를 만든다.
  await page.goto('/itinerary')
  await serviceWorkerReady(page)
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('mongolia-friends-trip:forecast:')) localStorage.removeItem(key)
    }
  })

  await context.setOffline(true)
  await page.reload()

  const panel = page.locator('.weather-panel')
  await expect(panel).toContainText('네트워크에 연결되어 있지 않아')
  await expect(page.getByText('Failed to fetch')).toHaveCount(0)

  await context.setOffline(false)
})
