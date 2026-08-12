import { Page, Locator } from '@playwright/test';

export class SearchModal {
	readonly page: Page;
	readonly dialog: Locator;
	readonly searchInput: Locator;
	readonly viewFullResultsButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.dialog = page.getByRole('dialog', { name: 'Search' });
		// getByLabel('Search') is ambiguous here: the submit button also has aria-label="Search".
		this.searchInput = this.dialog.getByRole('textbox', { name: 'Search' });
		this.viewFullResultsButton = this.dialog.getByRole('button', { name: 'VIEW FULL RESULTS' });
	}

	async search(text: string) {
		await this.searchInput.fill(text);
		await this.viewFullResultsButton.click();
	}
}

export class NewPasswordModal {
	readonly page: Page;
	readonly dialog: Locator;
	readonly currentPasswordInput: Locator;
	readonly newPasswordInput: Locator;
	readonly confirmNewPasswordInput: Locator;
	readonly saveButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.dialog = page.getByRole('dialog', { name: 'Edit Password' });
		this.currentPasswordInput = this.dialog.getByLabel('Current Password');
		this.newPasswordInput = this.dialog.getByLabel('New Password', { exact: true });
		this.confirmNewPasswordInput = this.dialog.getByLabel('Confirm New Password');
		this.saveButton = this.dialog.getByRole('button', { name: 'Save' });
	}

	async changePassword(currentPassword: string, newPassword: string) {
		await this.currentPasswordInput.fill(currentPassword);
		await this.newPasswordInput.fill(newPassword);
		await this.confirmNewPasswordInput.fill(newPassword);
		await this.saveButton.click();
	}
}

export class ShoppingCartModal {
	readonly page: Page;
	readonly dialog: Locator;
	readonly viewBagLink: Locator;
	readonly checkoutLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.dialog = page.getByRole('dialog', { name: 'Added to cart' });
		this.viewBagLink = this.dialog.getByRole('link', { name: /View Bag/ });
		this.checkoutLink = this.dialog.getByRole('link', { name: 'Checkout' });
	}
}
