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

	test('h1 should be visible on the home page', async () => {
		await homePage.navigate()
		await page.waitForLoadState('networkidle')

		const pageTitle = await homePage.getPageTitle()
		expect(pageTitle).toBe('Sell stuff for sats')

		// const isListButtonVisible = await homePage.isListMyStuffButtonVisible()
		// expect(isListButtonVisible).toBe(true)
	})
})
