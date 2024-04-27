import { afterAll, beforeAll, describe, test } from 'vitest'
import type { PreviewServer } from 'vite'
import { preview } from 'vite'
import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { expect } from '@playwright/test'

const PORT = 5173

describe('stalls', async () => {
	let server: PreviewServer
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		server = await preview({ preview: { port: PORT, strictPort: true } })
		browser = await chromium.launch({ headless: true })
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser?.close()
		await new Promise<void>((resolve, reject) => {
			server?.httpServer.close((error) => (error ? reject(error) : resolve()))
		})
	})

	test('stall page should be visible after navigation', async () => {
		await page.goto(`http://localhost:${PORT}`)
		await page.click('text=Stall browser')
		await page.waitForURL('**/stalls')
		const pageTitle = await page.textContent('h2')
		expect(pageTitle).toBe('Stalls')
	}, 10_000)

	test('stall items should be visible', async () => {
		await page.goto(`http://localhost:${PORT}/stalls`)
		const allLinks = await page.$$('a')
		const hrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))
		expect(hrefs.some((href) => href.startsWith('/stalls/'))).toBe(true)
	})
})
