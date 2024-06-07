import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import * as setupSvcExports from '$lib/server/setup.service'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, test, vi } from 'vitest'

vi.spyOn(setupSvcExports, 'isInitialSetup')
vi.mock('$lib/server/setup.service', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/server/setup.service')>()
	return {
		...actual,
		isInitialSetup: vi.fn().mockResolvedValue(false),
	}
})

describe('stalls', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser?.close()
	})

	test('stall page should be visible after navigation', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)
		await page.click('text=Stall browser')
		await page.waitForURL(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/stalls`)
		const pageTitle = await page.textContent('h2')
		expect(pageTitle).toBe('Stalls')
	})

	test('stall items should be visible', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/stalls`)
		const allLinks = await page.$$('a')
		const hrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))
		expect(hrefs.some((href) => href.startsWith('/stalls/'))).toBe(true)
	})
})
