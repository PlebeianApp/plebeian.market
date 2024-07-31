import type { Browser, Page } from 'playwright'
import { expect } from '@playwright/test'
import { chromium } from 'playwright'
import { afterAll, beforeAll, describe, test } from 'vitest'

import { opts } from './globalSetup'
import { login, safeClick } from './utils/testUtils'

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
		expect(hrefs.some((href) => href?.startsWith('/stalls/'))).toBe(true)
	})

	test('create a new stall', async () => {
		// Navigate to the stall creation page
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)

		await login(page)
		await page.click('#menuButton', { delay: 100 })

		await page.evaluate(() => {
			const settingsLink = document.querySelector('a[href="/settings"]')
			if (settingsLink) {
				;(settingsLink as HTMLElement).click()
			}
		})

		await page.click('text=Stalls')
		await page.click('text=New')
		await page.fill('input[name="title"]', 'My super Stall')
		await page.fill('textarea[name="description"]', 'This is a super stall description')

		// Select currency
		await page.click('button:has-text("BTC")')
		await page.click('text=USD')

		// Add shipping method
		await page.click('button:has-text("Add Shipping Method")')
		await page.fill('input[id="shipping-name-0"]', 'Standard Shipping')
		await page.fill('input[id="shipping-cost-0"]', '10')

		// Select countries for first shipping method
		await page.click('button:has-text("Select")')
		await page.fill('input[placeholder="Search country..."]', 'USA')
		await page.click('text=USA')
		await page.keyboard.press('Escape')

		// Submit the form
		await page.click('#stall-save-button')

		// Verify that the new stall appears in the list
		const stallName = await page.textContent('text=My super Stall')
		expect(stallName).toBe('My super Stall')
	})
})
