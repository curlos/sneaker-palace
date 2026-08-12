import { Page, Locator } from '@playwright/test';

export class ReviewFormPage {
	readonly page: Page;
	readonly heading: Locator;
	readonly summaryInput: Locator;
	readonly reviewTextInput: Locator;
	readonly submitButton: Locator;
	readonly editButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.heading = page.getByRole('heading', { name: 'WRITE YOUR REVIEW', level: 1 });
		this.summaryInput = page.getByLabel('Summary');
		this.reviewTextInput = page.getByLabel('Your Review');
		this.submitButton = page.getByRole('button', { name: 'SUBMIT REVIEW' });
		this.editButton = page.getByRole('button', { name: 'EDIT REVIEW' });
	}

	async fill(summary: string, text: string) {
		// The star rating's accessible radio group is sr-only and clipped out of the
		// layout, so a coordinate-based click can land outside the input. Click the
		// DOM node directly instead.
		await this.page.getByLabel('3 stars').evaluate((el) => (el as HTMLInputElement).click());
		await this.summaryInput.fill(summary);
		await this.reviewTextInput.fill(text);
	}
}
