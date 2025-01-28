import type { Browser, Page } from 'playwright'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { HomePage } from './page/homePage'
import { setupBrowser, teardownBrowser } from './utils/testUtils'

describe('Home Page', () => {
	let browser: Browser
	let page: Page
	let homePage: HomePage

	beforeEach(async () => {
		;({ browser, page } = await setupBrowser())
		homePage = new HomePage(page)
	})

	afterEach(async () => {
		await teardownBrowser(browser)
	})

	test('hero section should be visible on the home page', async () => {
		await homePage.navigate()

		await page.waitForLoadState('networkidle')

		const heroSection = page.getByRole('main').locator('#hero-section')

		try {
			await heroSection.waitFor({
				state: 'visible',
				timeout: 5000,
			})

			expect(await heroSection.isVisible()).toBe(true)
		} catch (error) {
			const isPresent = (await heroSection.count()) > 0
			throw new Error(`Hero section visibility test failed. ` + `Element exists in DOM: ${isPresent}. `)
		}
	})
})
