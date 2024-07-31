import type { Page } from 'playwright'

import { config } from '../config'

export class HomePage {
	constructor(private page: Page) {}

	async navigate(): Promise<void> {
		await this.page.goto(config.baseUrl)
	}

	async getPageTitle(): Promise<string | null> {
		return this.page.textContent('h1')
	}

	async clickListMyStuffButton(): Promise<void> {
		await this.page.click('text=List my stuff')
	}

	async isListMyStuffButtonVisible(): Promise<boolean> {
		const button = await this.page.$('text=List my stuff')
		return button !== null
	}
}
