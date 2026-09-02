import { expect, test } from '@playwright/test'

/** 안드로이드/크롬이 던지는 설치 이벤트를 흉내낸다. prompt()가 불렸는지도 기록한다. */
async function fireInstallPrompt(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt') as Event & { prompt?: () => Promise<void> }
    event.prompt = () => {
      ;(window as unknown as { __promptCalled?: boolean }).__promptCalled = true
      return Promise.resolve()
    }
    window.dispatchEvent(event)
  })
}

test.describe('설치 배너', () => {
  test('설치 가능 신호가 없으면 배너를 띄우지 않는다', async ({ page }) => {
    await page.goto('/itinerary')
    await expect(page.locator('.install-banner')).toHaveCount(0)
  })

  test('설치 가능해지면 설치 버튼을 띄우고 프롬프트를 넘긴다', async ({ page }) => {
    await page.goto('/itinerary')
    await fireInstallPrompt(page)

    const banner = page.locator('.install-banner')
    await expect(banner).toBeVisible()
    await expect(banner.getByText('홈 화면에 추가해 두세요')).toBeVisible()
    await banner.getByRole('button', { name: '설치' }).click()

    expect(await page.evaluate(() => (window as unknown as { __promptCalled?: boolean }).__promptCalled)).toBe(true)
    await expect(banner).toHaveCount(0)
  })

  test('닫으면 다시 열어도 나오지 않는다', async ({ page }) => {
    await page.goto('/itinerary')
    await fireInstallPrompt(page)
    await page.locator('.install-banner').getByRole('button', { name: '닫기' }).click()
    await expect(page.locator('.install-banner')).toHaveCount(0)

    await page.reload()
    await fireInstallPrompt(page)
    await expect(page.locator('.install-banner')).toHaveCount(0)
  })
})

test.describe('iOS Safari', () => {
  // devices['iPhone 13']은 webkit을 강제해 describe에서 쓸 수 없다.
  // 검증 대상은 UA 판별 로직이므로 userAgent만 바꿔도 충분하다.
  test.use({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' })

  test('설치 이벤트가 없어도 공유 시트 안내를 보여준다', async ({ page }) => {
    await page.goto('/itinerary')
    const banner = page.locator('.install-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText('홈 화면에 추가')
    // iOS는 코드로 설치를 띄울 수 없으니 설치 버튼이 있으면 거짓말이 된다.
    await expect(banner.getByRole('button', { name: '설치' })).toHaveCount(0)
  })
})
