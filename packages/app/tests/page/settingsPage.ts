import type { Page } from 'playwright'

import { config } from '../config'

export class SettingsPage {
	constructor(private page: Page) {}

	async navigate(): Promise<void> {
		await this.page.goto(`${config.baseUrl}/settings`)
	}

	async fillProfileForm(name: string, about: string, nip05: string): Promise<void> {
		await this.page.fill('#name', name)
		await this.page.fill('#about', about)
		await this.page.fill('#nip05', nip05)
	}

	async submitProfileForm(): Promise<void> {
		await this.page.click('#userDataSubmit')
	}

	async navigateToAccountDeletion(): Promise<void> {
		await this.page.click('text=Delete account')
	}

	async fillAccountDeletionChallenge(challenge: string): Promise<void> {
		await this.page.waitForSelector('#accountDeletionChallenge')
		await this.page.fill('#accountDeletionChallenge', challenge)
	}

	async submitAccountDeletion(): Promise<void> {
		await this.page.click('#executeDeletion')
	}

	async getInputValue(selector: string): Promise<string> {
		return this.page.inputValue(selector)
	}
}
