import { Page, Locator } from '@playwright/test';

export class ProductListPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly filtersButton: Locator;
	readonly sortButton: Locator;
	readonly productCards: Locator;
	readonly nextPageLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { level: 1 });
		this.filtersButton = page.getByRole('button', { name: 'Filters' });
		this.sortButton = page.getByRole('button', { name: /^Sort by:/ });
		// Scoped to #main-content because the sitewide Footer also renders a
		// static list of shoe links on every page, which would otherwise be
		// counted alongside the actual result grid.
		this.productCards = page.locator('#main-content a[href^="/shoe/"]');
		this.nextPageLink = page.getByRole('link', { name: 'Next page' });
	}

	async goto(query = '') {
		await this.page.goto(`/shoes${query}`);
	}

	async openFirstProduct() {
		await this.productCards.first().click();
	}

	async openProduct(index: number) {
		await this.productCards.nth(index).click();
	}

	async openFilters() {
		if ((await this.filtersButton.getAttribute('aria-expanded')) !== 'true') {
			await this.filtersButton.click();
		}
	}

	async expandFilterGroup(name: string) {
		const groupButton = this.page.getByRole('button', { name, exact: true });
		if ((await groupButton.getAttribute('aria-expanded')) !== 'true') {
			await groupButton.click();
		}
	}

	async selectSort(option: string) {
		await this.sortButton.click();
		await this.page.getByRole('menuitem', { name: option }).click();
	}
}
