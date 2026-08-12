import { Page, Locator } from '@playwright/test';

export class OrdersPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly emptyMessage: Locator;
	readonly orderShoesLink: Locator;
	readonly viewDetailsLinks: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: 'Your Orders', level: 1 });
		this.emptyMessage = page.getByText('No orders found');
		this.orderShoesLink = page.getByRole('link', { name: 'Order shoes' });
		this.viewDetailsLinks = page.getByRole('link', { name: 'View order details' });
	}

	async goto() {
		await this.page.goto('/orders');
	}
}
