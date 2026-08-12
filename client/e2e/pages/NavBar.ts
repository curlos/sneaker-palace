import { Page, Locator } from '@playwright/test';

export class NavBar {
	readonly page: Page;
	readonly nav: Locator;
	readonly searchButton: Locator;
	readonly cartLink: Locator;
	readonly loginLink: Locator;
	readonly registerLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.nav = page.getByRole('navigation', { name: 'Main' });
		this.searchButton = this.nav.getByRole('button', { name: 'Search' });
		this.cartLink = this.nav.getByRole('link', { name: /Shopping cart,/ });
		this.loginLink = this.nav.getByRole('link', { name: 'Login' });
		this.registerLink = this.nav.getByRole('link', { name: 'Sign Up' });
	}

	userMenuButton(firstName: string): Locator {
		return this.nav.getByRole('button', { name: `Hi, ${firstName}` });
	}

	async openUserMenu(firstName: string) {
		await this.userMenuButton(firstName).click();
	}

	// HeadlessUI's Menu.Item renders every item (link or button) with role="menuitem".
	profileLink(): Locator {
		return this.page.getByRole('menuitem', { name: 'Profile' });
	}

	ordersLink(): Locator {
		return this.page.getByRole('menuitem', { name: 'Orders' });
	}

	settingsLink(): Locator {
		return this.page.getByRole('menuitem', { name: 'Settings' });
	}

	signOutButton(): Locator {
		return this.page.getByRole('menuitem', { name: 'Sign Out' });
	}

	async openSearch() {
		await this.searchButton.click();
	}
}
