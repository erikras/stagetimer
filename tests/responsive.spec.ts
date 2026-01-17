import { test, expect } from '@playwright/test'

const viewports = [
  { width: 320, height: 568 },
  { width: 568, height: 320 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1920, height: 1080 },
]

test.describe('timer fits within viewport', () => {
  for (const { width, height } of viewports) {
    test(`fits at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')

      const shell = page.locator('.timer-shell')
      const time = page.locator('.time')

      await expect(shell).toBeVisible()
      await expect(time).toBeVisible()

      const shellBox = await shell.boundingBox()
      const timeBox = await time.boundingBox()
      expect(shellBox).not.toBeNull()
      expect(timeBox).not.toBeNull()
      if (!shellBox || !timeBox) return

      const widthFits = timeBox.width <= shellBox.width * 0.8 + 2
      const heightFits = timeBox.height <= shellBox.height * 0.8 + 2

      expect(widthFits, `width overflow at ${width}x${height}`).toBeTruthy()
      expect(heightFits, `height overflow at ${width}x${height}`).toBeTruthy()
    })
  }
})
