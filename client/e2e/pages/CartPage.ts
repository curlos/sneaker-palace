import { Page, Locator } from '@playwright/test';

export class CartPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly emptyMessage: Locator;
	readonly continueShoppingLink: Locator;
	readonly checkoutLink: Locator;
	readonly productLinks: Locator;
	readonly removeButton: Locator;
	readonly sizeSelect: Locator;
	readonly quantitySelect: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: 'Bag', level: 1 });
		this.emptyMessage = page.getByText('Your bag is empty.');
		this.continueShoppingLink = page.getByRole('link', { name: 'Continue shopping' });
		this.checkoutLink = page.getByRole('link', { name: 'Checkout' });
		// Scoped to #main-content because the sitewide Footer also renders a
		// static list of shoe links on every page, which would otherwise be
		// counted alongside the actual cart items.
		this.productLinks = page.locator('#main-content a[href^="/shoe/"]');
		this.removeButton = page.getByRole('button', { name: 'Remove' });
		this.sizeSelect = page.getByLabel('Size');
		this.quantitySelect = page.getByLabel('Quantity');
	}

	async goto() {
		await this.page.goto('/cart');
	}
}
