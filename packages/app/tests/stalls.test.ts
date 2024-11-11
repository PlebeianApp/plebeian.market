import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, test } from 'vitest'

import { opts } from './globalSetup'
import { login } from './utils/testUtils'

describe('stalls', async () => {
	let browser: Browser
	let page: Page

	beforeAll(async () => {
		browser = await chromium.launch(opts)
		page = await browser.newPage()
	})

	afterAll(async () => {
		await browser?.close()
	})

	test('stall items should be visible', async () => {
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/stalls`)
		const allLinks = await page.$$('a')
		const hrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))
		expect(hrefs.some((href) => href?.startsWith('/stalls/'))).toBe(true)
	})

	test('create a new stall', async () => {
		// Navigate to the stall creation page
		// console.log("Looking variables", dev,import.meta.env.VITEST)
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)
		await login(page)

		// Wait for menu button to be visible and click it
		await page.waitForSelector('#menuButton')
		await page.click('#menuButton', { delay: 100 })

		// Wait for settings link and click
		await page.waitForSelector('a[href="/settings"]')
		await page.evaluate(() => {
			const settingsLink = document.querySelector('a[href="/settings"]')
			if (settingsLink) {
				;(settingsLink as HTMLElement).click()
			}
		})

		// Wait for navigation
		await page.waitForURL(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/settings`)

		// Click stalls and wait for navigation
		await page.click('text=Stalls')
		await page.waitForSelector('text=New')
		await page.click('text=New')

		// Fill form fields with waits
		await page.waitForSelector('input[name="title"]')
		await page.fill('input[name="title"]', 'my super test Stall')
		await page.fill('textarea[name="description"]', 'This is a super stall description')

		// Select currency with explicit waits
		await page.waitForSelector('button:has-text("BTC")')
		await page.click('button:has-text("BTC")')
		await page.waitForSelector('text=USD')
		await page.click('text=USD')

		const button = await page.$('[data-testid="shipping-actions-0"] button >> nth=1')
		if (button) {
			await button.click()
		} else {
			console.error('Button not found')
		}

		// Click the add shipping method button
		await page.click('text=Add Shipping Method')

		// Add shipping method with waits
		await page.waitForSelector('input[id="shipping-name-0"]')
		await page.fill('input[id="shipping-name-0"]', 'Standard Shipping')
		await page.fill('input[id="shipping-cost-0"]', '10')

		// Select countries with waits
		await page.waitForSelector('button:has-text("Select")')
		await page.click('button:has-text("Select")')
		await page.waitForSelector('input[placeholder="Search country..."]')
		await page.fill('input[placeholder="Search country..."]', 'USA')
		await page.waitForSelector('text=USA')
		await page.click('text=USA')
		await page.keyboard.press('Escape')

		// Submit form and wait for save
		await page.waitForSelector('#stall-save-button')
		await page.click('#stall-save-button')

		// Wait for stall to appear and verify
		await page.waitForSelector('text=my super test Stall')
		const stallName = await page.textContent('text=my super test Stall')
		expect(stallName).toBe('my super test Stall')
	})
})
