import { afterAll, beforeAll, describe, test } from 'vitest'
import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { expect } from '@playwright/test'

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

	test('h1 should be visible', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}`)

		const pageTitle = await page.textContent('h1')
		expect(pageTitle).toBe('Sell stuff for sats')

		const listButton = await page.$('text=List my stuff')
		expect(listButton).not.toBeNull()
	})
})
