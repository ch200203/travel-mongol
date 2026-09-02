import { expect, test } from '@playwright/test'

const routes = [
  ['/expenses', '공동 장부'],
  ['/preparation', '준비물'],
  ['/itinerary', '별고비팀 세부 일정'],
  ['/album', '여행 앨범'],
  ['/guide', '별고비팀 여행 안내'],
] as const

for (const [route, heading] of routes) {
  test(`${route} 직접 접근이 SPA에서 복원된다`, async ({ page }) => {
    await page.goto(route)
    await expect(page).toHaveTitle('별고비팀 · 고비사막+테를지 5박 6일')
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
  const failedForecasts: number[] = []
  page.on('response', (response) => {
    if (response.url().includes('api.open-meteo.com') && !response.ok()) failedForecasts.push(response.status())
  })
  await page.goto('/itinerary')
  await expect(page.getByText('OM 310', { exact: true })).toBeVisible()
  await expect(page.getByText('OM 307', { exact: true })).toBeVisible()
  // 출발일까지 남은 일수에 따라 대기 안내와 실제 예보 중 하나가 보이며, 어느 쪽이든 오류는 없어야 한다.
  const panel = page.locator('.weather-panel')
  await expect(panel.locator('.forecast-pending, .weather-grid article').first()).toBeVisible()
  await expect(panel.getByText('날씨 예보를 불러오지 못했습니다.')).toHaveCount(0)
  expect(failedForecasts).toEqual([])
})

test('360px 일정 화면에 해·별 시간과 이동·숙소 정보를 표시한다', async ({ page }) => {
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

  await expect(page.getByText('31시간', { exact: true })).toBeVisible()
  await expect(page.getByText('2,000km', { exact: true })).toBeVisible()
  await expect(page.getByText('9/9 05:00', { exact: true })).toBeVisible()
  await expect(page.getByText('9/14 16:30', { exact: true })).toBeVisible()
  await expect(page.getByLabel('고비사막부터 테를지까지').getByText('11만원', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '별고비팀', exact: true })).toBeVisible()
  const firstDayGuide = page.locator('.day-guide-card').first()
  await expect(firstDayGuide.getByRole('heading', { name: '차강소브라가', exact: true })).toBeVisible()
  await expect(firstDayGuide.getByText('1인 +5만원', { exact: true })).toBeVisible()
  await expect(firstDayGuide.getByText('✓ 전기 무제한', { exact: true })).toBeVisible()
  await expect(firstDayGuide.getByText('✓ 샤워 무제한', { exact: true })).toBeVisible()
  await expect(firstDayGuide.getByText('✓ 인터넷 가능', { exact: true })).toBeVisible()
  const thirdDayGuide = page.locator('.day-guide-card').nth(2)
  await expect(thirdDayGuide.getByText('◷ 전기 23:00까지', { exact: true })).toBeVisible()
  await expect(thirdDayGuide.getByText('◷ 샤워 18:00~23:00', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: '노을 및 일몰 감상' })).toBeVisible()
  await expect(page.getByText('특식: 삼겹살 · 은하수 헌팅', { exact: true })).toBeVisible()
  await expect(page.getByText('15:00 공항 샌딩', { exact: true })).toBeVisible()
  await expect(page.getByText('16:30 공항 도착', { exact: true })).toBeVisible()
  await expect(page.getByText('18:15 비행기 탑승', { exact: true })).toBeVisible()

  await page.locator('.tour-operator summary').click()
  await expect(page.getByRole('link', { name: '홈페이지 ↗' })).toHaveAttribute('href', 'https://www.yeonatour.com/')
  await expect(page.getByRole('link', { name: '카카오채널 상담 ↗' })).toHaveAttribute('href', 'https://pf.kakao.com/_TxnGHG/chat')

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

test('안내 페이지에서 공항 미팅과 긴급 연락처를 확인한다', async ({ page }) => {
  await page.goto('/guide')
  await expect(page.getByText('9월 9일 05:00', { exact: true })).toBeVisible()
  await expect(page.getByText('탐앤탐스 카페 앞', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: '울란바토르 국제공항 국제선 도착장 옆 탐앤탐스 카페 미팅 장소' })).toBeVisible()
  await expect(page.getByRole('link', { name: '공항 미팅 장소 사진 크게 보기' })).toHaveAttribute('target', '_blank')
  await expect(page.getByRole('link', { name: '+82-2-3210-0404' })).toHaveAttribute('href', 'tel:+82232100404')
  await expect(page.getByText('GobiSuntravel', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: '여나투어 출발 전 안내 (노션) ↗' })).toBeVisible()

  await page.getByText('숙소 전기와 샤워 시간').click()
  await expect(page.getByText('🔌 전기 23:00까지 · 🚿 샤워 18:00~23:00', { exact: true })).toBeVisible()
  await expect(page.getByText('🔌 전기 무제한 · 🚿 샤워 19:00~23:00', { exact: true })).toBeVisible()

  await page.getByText('액티비티와 안전').click()
  await expect(page.getByRole('heading', { name: '승마 · 낙타 체험' })).toBeVisible()
  await expect(page.getByText('모터보트')).toHaveCount(0)
})

test('앨범이 Day별 목적지와 실제 일정 개수를 센다', async ({ page }) => {
  await page.goto('/album')
  const firstDay = page.locator('.album-days article').first()
  await expect(firstDay.getByRole('heading', { name: '차강소브라가' })).toBeVisible()
  // source 필터 회귀 방지: 로컬 시드는 전부 manual이라 예전 필터에서는 0개로 나왔다.
  await expect(page.getByText(/일정 0개/)).toHaveCount(0)
  await expect(firstDay.getByText(/일정 7개/)).toBeVisible()
  await expect(page.locator('.album-days article')).toHaveCount(6)
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
  await expect(page.getByText('손전등·헤드랜턴', { exact: true })).toBeVisible()
  await expect(page.getByText('모래썰매용 긴 바지', { exact: true })).toBeVisible()
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
