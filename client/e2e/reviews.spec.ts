import { Page, expect } from '@playwright/test';
import { test } from './fixtures/auth';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ReviewFormPage } from './pages/ReviewFormPage';

// Reviews land on a real, shared shoe (the catalog's first-listed one), so a
// fixed summary would collide with reviews left by other runs/workers. A
// unique summary plus scoping to "the review with an Edit link" (the
// logged-in user's own) keeps each test's assertions unambiguous.
function uniqueSummary() {
	return `Great shoe ${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function submitReview(page: Page, summary: string, text: string) {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	await productList.goto();
	await productList.openFirstProduct();
	const shoeUrl = page.url();

	await productDetail.writeReviewLink.click();
	const reviewForm = new ReviewFormPage(page);
	await expect(reviewForm.heading).toBeVisible();
	await reviewForm.fill(summary, text);
	await reviewForm.submitButton.click();

	return shoeUrl;
}

function ownReview(page: Page) {
	return page.locator('article').filter({ has: page.getByRole('link', { name: 'Edit review' }) });
}

test('a logged-in user can submit a review', async ({ page, testUser: _testUser }) => {
	const summary = uniqueSummary();
	const shoeUrl = await submitReview(page, summary, 'Comfortable and true to size.');

	await page.waitForURL(shoeUrl);
	await expect(ownReview(page)).toBeVisible();
	await expect(ownReview(page).getByText(summary)).toBeVisible();
});

test('a user can edit their own review', async ({ page, testUser: _testUser }) => {
	const shoeUrl = await submitReview(page, uniqueSummary(), 'Comfortable and true to size.');
	await page.waitForURL(shoeUrl);

	await ownReview(page).getByRole('link', { name: 'Edit review' }).click();

	const reviewForm = new ReviewFormPage(page);
	const updatedSummary = uniqueSummary();
	await expect(reviewForm.editButton).toBeVisible();
	await reviewForm.summaryInput.fill(updatedSummary);
	await reviewForm.editButton.click();

	await page.waitForURL(shoeUrl);
	await expect(ownReview(page).getByText(updatedSummary)).toBeVisible();
});

test('a user can delete their own review', async ({ page, testUser: _testUser }) => {
	const shoeUrl = await submitReview(page, uniqueSummary(), 'Comfortable and true to size.');
	await page.waitForURL(shoeUrl);

	await ownReview(page).getByRole('button', { name: 'Delete review' }).click();
	await expect(ownReview(page)).not.toBeVisible();

	// Reload to confirm the deletion actually persisted server-side, not just
	// an optimistic UI removal.
	await page.reload();
	await expect(ownReview(page)).not.toBeVisible();
});
