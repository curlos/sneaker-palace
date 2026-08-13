import { Page, expect } from '@playwright/test';
import { test } from './fixtures/auth';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ReviewFormPage } from './pages/ReviewFormPage';
import { RegisterPage } from './pages/RegisterPage';
import { NavBar } from './pages/NavBar';
import { makeTestUser } from './utils/testUser';

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

// ratingRouter.ts's edit/delete endpoints check `rating.userID === req.user.id`
// and return 403 otherwise - a real authorization boundary that can only be
// proven by actually attempting it as a different, real logged-in user
// against the real backend, not something a mock could verify. Driven via
// page.request (real backend, real DB) rather than the UI, since the UI
// itself never renders an "Edit review" link for another user's review in
// the first place (see Review.tsx) - there's no button to click to trigger
// this path, only a direct request can.
test("a user cannot edit or delete another user's review", async ({ page, testUser }) => {
	const summary = uniqueSummary();
	const shoeUrl = await submitReview(page, summary, 'Comfortable and true to size.');
	await page.waitForURL(shoeUrl);

	const editHref = await ownReview(page).getByRole('link', { name: 'Edit review' }).getAttribute('href');
	const reviewID = editHref!.split('/').pop();

	const navBar = new NavBar(page);
	await navBar.openUserMenu(testUser.firstName);
	await navBar.signOutButton().click();
	// Same logout race as elsewhere in the suite - wait for the logged-out
	// state before registering a second account.
	await expect(navBar.loginLink).toBeVisible();

	const registerPage = new RegisterPage(page);
	await registerPage.goto();
	await registerPage.register(makeTestUser());
	await page.waitForURL('/');

	// waitForURL only guarantees the redux dispatch (and thus the navigation)
	// has happened - redux-persist's write to localStorage is async/debounced,
	// so it can still lag behind by a tick. Poll instead of reading once.
	const accessTokenHandle = await page.waitForFunction(() => {
		const persistRoot = JSON.parse(localStorage.getItem('persist:root') || 'null');
		return persistRoot ? (JSON.parse(persistRoot.user)?.currentUser?.accessToken ?? null) : null;
	});
	const accessToken = await accessTokenHandle.jsonValue();
	const headers = { Authorization: `Bearer ${accessToken}` };

	const editResponse = await page.request.put(`http://localhost:8888/rating/edit/${reviewID}`, {
		headers,
		data: { summary: 'hijacked' },
	});
	expect(editResponse.status()).toBe(403);

	const deleteResponse = await page.request.delete(`http://localhost:8888/rating/${reviewID}`, { headers });
	expect(deleteResponse.status()).toBe(403);

	// Confirm the review genuinely wasn't touched, not just that we got a 403
	// back - the original summary should still be there, unchanged.
	await page.goto(shoeUrl);
	await expect(page.getByText(summary)).toBeVisible();
});

// Deliberately not requesting the `testUser` fixture - App.tsx redirects
// /shoe/submit-review/:shoeID to /login when logged out, so this documents
// that guard is real, not an oversight.
test('writing a review as a guest redirects to login', async ({ page }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	await productList.goto();
	await productList.openFirstProduct();

	await productDetail.writeReviewLink.click();

	await expect(page).toHaveURL('/login');
});
