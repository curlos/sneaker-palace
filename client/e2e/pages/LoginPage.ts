import { Page, Locator } from '@playwright/test';

export class LoginPage {
	readonly page: Page;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly signInButton: Locator;
	readonly errorAlert: Locator;
	readonly signUpLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.emailInput = page.getByLabel('Email address');
		this.passwordInput = page.getByLabel('Password');
		this.signInButton = page.getByRole('button', { name: 'SIGN IN' });
		this.errorAlert = page.getByRole('alert');
		this.signUpLink = page.getByRole('link', { name: 'Sign up.' });
	}

	async goto() {
		await this.page.goto('/login');
	}

	async login(email: string, password: string) {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
		await this.signInButton.click();
	}
}
