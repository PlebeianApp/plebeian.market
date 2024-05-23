import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, test } from 'vitest'

import { appSettings, db } from '@plebeian/database'

describe('home', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser?.close()
	})

	test('h1 should be visible or redirect to setup page', async () => {
		const [appSettingsRes] = await db.select().from(appSettings).execute()
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)

		if (appSettingsRes.isFirstTimeRunning) {
			expect(page.url()).toBe(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/setup`)
		} else {
			const pageTitle = await page.textContent('h1')
			expect(pageTitle).toBe('Sell stuff for sats')

			const listButton = await page.$('text=List my stuff')
			expect(listButton).not.toBeNull()
		}
	})
})
