import { Page, Locator } from '@playwright/test';

export class HomePage {
	readonly page: Page;
	readonly popularBrandsHeading: Locator;
	readonly seeAllLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.popularBrandsHeading = page.getByRole('heading', { name: 'Popular Brands' });
		this.seeAllLink = page.getByRole('link', { name: 'See All' });
	}

	async goto() {
		await this.page.goto('/');
	}
}
