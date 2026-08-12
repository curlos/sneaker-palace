import { Page, Locator } from '@playwright/test';

export class ProductDetailPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly addToBagButton: Locator;
	readonly sizeGroup: Locator;
	readonly favoriteButton: Locator;
	readonly writeReviewLink: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { level: 1 });
		this.addToBagButton = page.getByRole('button', { name: 'Add to Bag' });
		this.sizeGroup = page.getByRole('radiogroup');
		this.favoriteButton = page.getByRole('button', { name: /Add to favorites|Remove from favorites/ });
		this.writeReviewLink = page.getByRole('link', { name: 'Write a customer review' });
	}

	async selectFirstAvailableSize() {
		await this.sizeGroup.getByRole('radio').first().click();
	}

	async addToBag() {
		await this.selectFirstAvailableSize();
		await this.addToBagButton.click();

		// The confirmation modal opens synchronously, before the cart mutation
		// resolves. Wait for the nav cart count to actually update so a
		// subsequent navigation (e.g. to /cart) doesn't race ahead of it.
		await this.page.getByRole('link', { name: /Shopping cart, [1-9]/ }).waitFor();
	}
}
