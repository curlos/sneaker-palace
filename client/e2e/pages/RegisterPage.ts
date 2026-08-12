import { Page, Locator } from '@playwright/test';
import { TestUser } from '../utils/testUser';

export class RegisterPage {
	readonly page: Page;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly firstNameInput: Locator;
	readonly lastNameInput: Locator;
	readonly signUpButton: Locator;
	readonly errorAlert: Locator;

	constructor(page: Page) {
		this.page = page;
		this.emailInput = page.getByLabel('Email address');
		this.passwordInput = page.getByLabel('Password');
		this.firstNameInput = page.getByLabel('First Name');
		this.lastNameInput = page.getByLabel('Last Name');
		this.signUpButton = page.getByRole('button', { name: 'SIGN UP' });
		this.errorAlert = page.getByRole('alert');
	}

	async goto() {
		await this.page.goto('/register');
	}

	async register(user: TestUser) {
		await this.emailInput.fill(user.email);
		await this.passwordInput.fill(user.password);
		await this.firstNameInput.fill(user.firstName);
		await this.lastNameInput.fill(user.lastName);
		await this.signUpButton.click();
	}
}
