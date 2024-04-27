import { afterAll, beforeAll, describe, test } from 'vitest'
import type { PreviewServer } from 'vite'
import { preview } from 'vite'
import type { Browser, Page } from 'playwright'
import { chromium } from 'playwright'
import { expect } from '@playwright/test'

const PORT = 5173

describe('home', async () => {
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

	test('h1 should be visible', async () => {
		await page.goto(`http://localhost:${PORT}`)

		const pageTitle = await page.textContent('h1')
		expect(pageTitle).toBe('Sell stuff for sats')

		const listButton = await page.$('text=List my stuff')
		expect(listButton).not.toBeNull()
	}, 60_000)
})
