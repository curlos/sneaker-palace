import { Page, Locator } from '@playwright/test';

export class SettingsPage {
	readonly page: Page;
	readonly accountDetailsTab: Locator;
	readonly shopPreferencesTab: Locator;
	readonly saveButton: Locator;
	readonly firstNameInput: Locator;
	readonly shoeSizeSelect: Locator;
	readonly passwordField: Locator;

	constructor(page: Page) {
		this.page = page;
		this.accountDetailsTab = page.getByRole('tab', { name: 'Account Details' });
		this.shopPreferencesTab = page.getByRole('tab', { name: 'Shop Preferences' });
		this.saveButton = page.getByRole('button', { name: 'Save' });
		this.firstNameInput = page.getByLabel('First Name');
		this.shoeSizeSelect = page.getByLabel('Shoe Size');
		this.passwordField = page.getByLabel('Password', { exact: true });
	}

	async goto() {
		await this.page.goto('/settings');
	}
}
