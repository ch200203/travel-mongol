import { expect, test } from '@playwright/test'

// 타일은 외부 서버에 의존하므로 검증하지 않고, 번들에 포함된 마커·경로·범례만 확인한다.
test('이동 경로 지도에 일차별 지점이 표시된다', async ({ page }) => {
  await page.goto('/itinerary')
  const map = page.getByRole('application', { name: '여행 이동 경로 지도' })
  await expect(map).toBeVisible()
  await expect(map.locator('.route-pin')).toHaveCount(6)
  await expect(map.locator('.route-label')).toHaveCount(6)
  await expect(map.locator('path.leaflet-interactive')).toHaveCount(1)
})

test('범례를 누르면 해당 지점 정보가 열린다', async ({ page }) => {
  await page.goto('/itinerary')
  await page.getByRole('button', { name: /Day 3/ }).click()
  const popup = page.locator('.route-popup')
  await expect(popup).toContainText('Day 3 · 홍고린엘스')
  await expect(popup).toContainText('이동 5시간 · 300km')
  await expect(popup.getByRole('link', { name: /구글 지도/ }))
    .toHaveAttribute('href', 'https://www.google.com/maps/search/?api=1&query=43.78,102.18')
})
