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
		await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/community`)
		const allLinks = await page.$$('a')
		const hrefs = await Promise.all(allLinks.map((link) => link.getAttribute('href')))
		expect(hrefs.some((href) => href?.startsWith('/community/'))).toBe(true)
	})

	test('create a new stall', async () => {
		try {
			await page.goto(`http://${process.env.APP_HOST}:${process.env.APP_PORT}/`)
			try {
				const dialogButton = await page.waitForSelector('text=I understand', { timeout: 2000 })
				if (dialogButton) {
					await dialogButton.click()
				}
			} catch (error) {
				console.log('No registration dialog found, continuing...')
			}

			await login(page)

			try {
				await page.waitForSelector('#dash-button', { timeout: 5000 })
				await page.click('#dash-button')
			} catch (error) {
				console.error('Failed to navigate to settings:', error)
				throw error
			}

			await page.waitForSelector('text=Shops', { timeout: 2000 })
			await page.click('text=Shops')
			await page.waitForSelector('text=New', { timeout: 2000 })
			await page.click('text=New')

			// Fill basic stall info
			try {
				await page.waitForSelector('input[name="title"]', { timeout: 2000 })
				await page.fill('input[name="title"]', 'My super Stall')
				await page.fill('textarea[name="description"]', 'This is a super stall description')
			} catch (error) {
				console.error('Failed to fill basic stall info:', error)
				throw error
			}

			// Select currency
			try {
				await page.waitForSelector('button:has-text("SATS")', { timeout: 2000 })
				await page.click('button:has-text("SATS")')
				await page.waitForSelector('text=USD', { timeout: 2000 })
				await page.click('text=USD')
			} catch (error) {
				console.error('Failed to select currency:', error)
				throw error
			}

			// Navigate through tabs
			try {
				await page.click('#next-tab-button') // To Header
				await page.click('#next-tab-button') // To Location
				await page.click('#next-tab-button') // To Shipping
			} catch (error) {
				console.error('Failed to navigate tabs:', error)
				throw error
			}

			// Add shipping method
			try {
				await page.click('#add-shipping-method')
				await page.waitForSelector('input[id="shipping-name-0"]', { timeout: 2000 })
				await page.fill('input[id="shipping-name-0"]', 'Standard Shipping')
				await page.fill('input[id="shipping-cost-0"]', '10')
			} catch (error) {
				console.error('Failed to add shipping method:', error)
				throw error
			}

			// Select shipping country
			try {
				await page.click('button:has-text("Select")')
				await page.waitForSelector('input[placeholder="Search country..."]', { timeout: 2000 })
				await page.fill('input[placeholder="Search country..."]', 'USA')
				await page.waitForSelector('text=USA', { timeout: 2000 })
				await page.click('text=USA')
				await page.keyboard.press('Escape')
			} catch (error) {
				console.error('Failed to select shipping country:', error)
				throw error
			}

			// Save stall
			try {
				await page.click('#save-stall-button')
			} catch (error) {
				console.error('Failed to save stall:', error)
				throw error
			}
		} catch (error) {
			console.error('Test failed:', error)
			throw error
		}
	})
})
