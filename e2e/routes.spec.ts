import { expect, test } from '@playwright/test'

const routes = [
  ['/expenses', '공동 장부'],
  ['/preparation', '준비물'],
  ['/itinerary', '여행 일정'],
  ['/album', '여행 앨범'],
] as const

for (const [route, heading] of routes) {
  test(`${route} 직접 접근이 SPA에서 복원된다`, async ({ page }) => {
    await page.goto(route)
    await expect(page).toHaveTitle('몽골 원정대')
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
    await expect(page.getByText('이 기기에 저장')).toBeVisible()
  })
}

test('360px 로컬 모드에서 비용을 저장한다', async ({ page }) => {
  test.setTimeout(10_000)
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto('/expenses')
  await page.getByRole('button', { name: '+ 비용 기록' }).click()
  await page.getByLabel('사용 내용').fill('로컬 테스트 비용')
  await page.getByLabel('금액').fill('12000')
  await page.locator('select[name="payer"]').selectOption({ label: '김승미' })
  await page.getByRole('button', { name: '저장' }).click()
  await expect(page.getByRole('heading', { name: '로컬 테스트 비용' })).toBeVisible()
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasOverflow).toBe(false)
})

test('확정 항공편과 예보 가능 시점을 표시한다', async ({ page }) => {
  await page.goto('/itinerary')
  await expect(page.getByText('OM 310', { exact: true })).toBeVisible()
  await expect(page.getByText('OM 307', { exact: true })).toBeVisible()
  await expect(page.getByText('8월 25일부터 상세 예보를 확인할 수 있어요.')).toBeVisible()
})

test('360px 일정 화면에 해·별 시간과 취소 일정을 표시한다', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 })
  await page.goto('/itinerary')

  const dayTwoAstronomy = page.getByLabel('Day 2 해와 별 관측 시간')
  await expect(dayTwoAstronomy).toBeVisible()
  await expect(dayTwoAstronomy).toHaveAttribute('open', '')
  await expect(page.getByText('별 보기 좋은 시간').first()).toBeVisible()
  await expect(page.getByText(/달 밝기/).first()).toBeVisible()
  await dayTwoAstronomy.locator('summary').click()
  await expect(dayTwoAstronomy).not.toHaveAttribute('open', '')
  await expect(dayTwoAstronomy.getByText('별 보기 좋은 시간')).not.toBeVisible()

  const cancelled = page.locator('.schedule-item.cancelled').filter({ hasText: '바가가즈린촐로 투어' })
  await expect(cancelled).toBeVisible()
  await expect(cancelled.getByText('취소', { exact: true })).toBeVisible()
  const decoration = await cancelled.getByRole('heading', { name: '바가가즈린촐로 투어' }).evaluate((element) => getComputedStyle(element).textDecorationLine)
  expect(decoration).toContain('line-through')

  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(hasOverflow).toBe(false)
})

test('상단 탭과 결제 단계 완료 상태를 표시한다', async ({ page }) => {
  await page.goto('/preparation')
  const nav = page.getByRole('navigation', { name: '주요 메뉴' })
  const heading = page.getByRole('heading', { name: '준비물', exact: true })
  expect((await nav.boundingBox())?.y).toBeLessThan((await heading.boundingBox())?.y ?? 0)
  await expect(page.getByText('1인 21만원')).toBeVisible()
  await expect(page.getByText('6/6명 완료')).toBeVisible()
})

test('첫 화면은 일정이며 공통/개인 준비가 분류된다', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/itinerary$/)
  await page.getByRole('link', { name: /준비물/ }).click()
  await expect(page.getByRole('heading', { name: '출발 전 반드시 확인' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '팀에서 선택할 항목' })).toBeVisible()
  await expect(page.getByText('운동화 준비', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '개인 준비물' }).click()
  await expect(page.getByText('보조배터리', { exact: true })).toBeVisible()
  await expect(page.getByText('여행자보험 가입 여부 결정', { exact: true })).toBeVisible()
})

test('공금 목표와 멤버 입금액을 집계한다', async ({ page }) => {
  await page.goto('/expenses')
  await page.getByRole('button', { name: '목표 설정' }).click()
  await page.getByLabel('목표 금액 (KRW)').fill('600000')
  await page.locator('.fund-form').getByRole('button', { name: '저장' }).click()
  await page.getByRole('button', { name: '+ 입금 기록' }).click()
  await page.locator('select[name="member"]').selectOption({ label: '김승미' })
  await page.getByLabel('입금액 (KRW)').fill('100000')
  await page.locator('.fund-form').getByRole('button', { name: '저장' }).click()
  await expect(page.getByText('17%', { exact: true })).toBeVisible()
  await expect(page.getByText('₩100,000', { exact: true }).first()).toBeVisible()
})
