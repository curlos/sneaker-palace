import { test, expect } from './fixtures/auth';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { RegisterPage } from './pages/RegisterPage';
import { makeTestUser } from './utils/testUser';
import { addToBagAndSync } from './utils/cart';

// Documents current, intended behavior: registering clears the guest cart
// rather than merging it into the new account's cart (see authUtils.ts's
// performLogin(), which calls updateGuestCart({ products: [], total: 0 })
// on every login/register).
test('guest cart items do not carry over after registering', async ({ page }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const cart = new CartPage(page);
	const registerPage = new RegisterPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	await productDetail.addToBag();

	await registerPage.goto();
	await registerPage.register(makeTestUser());
	// register() only waits for the click to dispatch, not for the async
	// registration chain (which clears the guest cart) to finish - wait for
	// the post-register redirect so we don't navigate to /cart before that
	// clear has actually happened. Same wait fixtures/auth.ts already uses.
	await page.waitForURL('/');

	await cart.goto();
	await expect(cart.emptyMessage).toBeVisible();
});

// A single flow test rather than three isolated ones: a real user edits a
// cart item's size, then its quantity, then removes it, all in the same
// session without reloading in between - so proving state survives across
// that sequence of real edits is itself the point, not just each edit in
// isolation.
test('cart edits (size, quantity, removal) persist across the session', async ({ page, testUser: _testUser }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const cart = new CartPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	await addToBagAndSync(page, productDetail);
	await cart.goto();

	const waitForCartSync = () =>
		page.waitForResponse((response) => response.url().includes('/cart') && response.request().method() === 'PUT');

	await test.step('changing size persists after reload', async () => {
		const currentSize = await cart.sizeSelect.inputValue();
		const firstOptionValue = await cart.sizeSelect.locator('option').first().getAttribute('value');
		const targetIndex = currentSize === firstOptionValue ? 1 : 0;

		const cartSynced = waitForCartSync();
		await cart.sizeSelect.selectOption({ index: targetIndex });
		await cartSynced;

		await expect(cart.sizeSelect).not.toHaveValue(currentSize);

		const newSize = await cart.sizeSelect.inputValue();
		await page.reload();
		await expect(cart.sizeSelect).toHaveValue(newSize);
	});

	await test.step('changing quantity persists after reload', async () => {
		const cartSynced = waitForCartSync();
		await cart.quantitySelect.selectOption('3');
		await cartSynced;

		await expect(cart.quantitySelect).toHaveValue('3');

		await page.reload();
		await expect(cart.quantitySelect).toHaveValue('3');
	});

	await test.step('removing the item empties the bag and persists after reload', async () => {
		const cartSynced = waitForCartSync();
		await cart.removeButton.click();
		await cartSynced;

		await expect(cart.emptyMessage).toBeVisible();
		await expect(cart.checkoutLink).not.toBeVisible();

		await page.reload();
		await expect(cart.emptyMessage).toBeVisible();
	});
});

test('adding two different products keeps both as separate items in the cart', async ({
	page,
	testUser: _testUser,
}) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const cart = new CartPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	const firstProductName = await productDetail.heading.textContent();
	await addToBagAndSync(page, productDetail);

	await productList.goto();
	await productList.openProduct(1);
	const secondProductName = await productDetail.heading.textContent();
	await addToBagAndSync(page, productDetail);

	await cart.goto();

	// Each cart line item renders two links to the same shoe (image + name),
	// so assert on distinct hrefs rather than the raw anchor count.
	await expect
		.poll(async () => {
			const hrefs = await cart.productLinks.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
			return new Set(hrefs).size;
		})
		.toBe(2);

	// Confirm it's specifically the two products that were added, not just any two.
	await expect(cart.productLinks.filter({ hasText: firstProductName! }).first()).toBeVisible();
	await expect(cart.productLinks.filter({ hasText: secondProductName! }).first()).toBeVisible();
});
