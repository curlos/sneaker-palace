import { Page, Locator, FrameLocator } from '@playwright/test';

export class CheckoutPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly payNowButton: Locator;
	readonly alert: Locator;
	readonly paymentFrame: FrameLocator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: 'Checkout', level: 1 });
		this.payNowButton = page.getByRole('button', { name: 'Pay Now' });
		this.alert = page.getByRole('alert');
		this.paymentFrame = page.frameLocator('iframe[title="Secure payment input frame"]');
	}

	async fillTestCard(cardNumber = '4242424242424242') {
		await this.paymentFrame.getByPlaceholder('1234 1234 1234 1234').fill(cardNumber);
		await this.paymentFrame.getByPlaceholder('MM / YY').fill('12/34');
		await this.paymentFrame.getByPlaceholder('CVC').fill('123');

		const zip = this.paymentFrame.getByLabel('ZIP code');
		if (await zip.count()) {
			await zip.fill('10001');
		}
	}

	async pay(cardNumber?: string) {
		await this.fillTestCard(cardNumber);
		await this.payNowButton.click();
	}
}
