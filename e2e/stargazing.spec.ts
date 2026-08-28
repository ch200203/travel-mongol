import { expect, test } from '@playwright/test'

// 실제 예보에 기대면 하늘 상태에 따라 결과가 달라지므로 구름 응답만 고정한다.
async function stubClouds(page: import('@playwright/test').Page, pattern: Record<number, number>) {
  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    if (!route.request().url().includes('hourly=cloud_cover')) return route.continue()
    const times: string[] = []
    for (const date of ['2026-09-09', '2026-09-10']) {
      for (let hour = 0; hour < 24; hour += 1) times.push(`${date}T${String(hour).padStart(2, '0')}:00`)
    }
    const one = { hourly: { time: times, cloud_cover: times.map((t) => pattern[Number(t.slice(11, 13))] ?? 50) } }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(Array(6).fill(one)) })
  })
}

test('맑은 밤은 관측 등급이 높게 나온다', async ({ page }) => {
  await stubClouds(page, { 22: 0, 23: 0, 0: 5, 1: 0, 2: 0, 3: 5, 4: 0 })
  await page.goto('/itinerary')
  const card = page.locator('.astronomy-card').first()
  await expect(card.locator('.star-grade b')).toHaveText('관측 아주 좋음')
  await expect(card.locator('.cloud-note')).toHaveText('밤새 맑을 것으로 보여요.')
})

test('구름 낀 밤은 등급이 내려가고 맑은 시간대를 알려준다', async ({ page }) => {
  await stubClouds(page, { 22: 95, 23: 80, 0: 10, 1: 5, 2: 15, 3: 70, 4: 90 })
  await page.goto('/itinerary')
  const card = page.locator('.astronomy-card').first()
  await expect(card.locator('.star-grade b')).toHaveText('관측 보통')
  await expect(card.locator('.star-grade small')).toHaveText('밤 구름 52%')
  await expect(card.locator('.cloud-note')).toHaveText('0시–2시가 가장 맑아요.')
  // 막대가 구름량만큼 채워진다.
  const fills = await card.locator('.cloud-bar-row b').evaluateAll((els) => els.map((e) => (e as HTMLElement).style.height))
  expect(fills).toEqual(['95%', '80%', '10%', '5%', '15%', '70%', '90%'])
})

test('구름 예보가 실패해도 해·달 정보는 남는다', async ({ page }) => {
  await page.route('**/api.open-meteo.com/v1/forecast**', async (route) => {
    if (!route.request().url().includes('hourly=cloud_cover')) return route.continue()
    await route.fulfill({ status: 500, body: '' })
  })
  await page.goto('/itinerary')
  const card = page.locator('.astronomy-card').first()
  await expect(card.getByText('별 보기 좋은 시간')).toBeVisible()
  await expect(card.locator('.star-grade')).toHaveCount(0)
})
