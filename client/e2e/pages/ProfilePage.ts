import { Page, Locator } from '@playwright/test';

export class ProfilePage {
	readonly page: Page;
	readonly reviewsTab: Locator;
	readonly favoritesTab: Locator;
	readonly reviewsPanel: Locator;
	readonly favoritesPanel: Locator;

	constructor(page: Page) {
		this.page = page;
		this.reviewsTab = page.getByRole('tab', { name: 'Reviews' });
		this.favoritesTab = page.getByRole('tab', { name: 'Favorites' });
		this.reviewsPanel = page.getByRole('tabpanel', { name: 'Reviews' });
		this.favoritesPanel = page.getByRole('tabpanel', { name: 'Favorites' });
	}
}
