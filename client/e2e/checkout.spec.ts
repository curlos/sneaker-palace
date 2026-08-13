import { test, expect } from './fixtures/auth';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { addToBagAndSync } from './utils/cart';

test('completing checkout with a test card reaches the success page', async ({ page, testUser: _testUser }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const cart = new CartPage(page);
	const checkout = new CheckoutPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	const productName = await productDetail.heading.textContent();
	await addToBagAndSync(page, productDetail);
	await cart.goto();
	await cart.checkoutLink.click();

	await checkout.pay();

	await page.waitForURL(/\/payment-success/);
	await expect(page.getByRole('heading', { name: /Hello/ })).toBeVisible();
	const orderDetailsLink = page.getByRole('link', { name: 'View or manage order' });
	await expect(orderDetailsLink).toBeVisible();

	// Confirms the direct post-payment link (the only way a guest can ever
	// reach their order, per the guest checkout test below) also works
	// correctly for a logged-in user, not just the /orders-list path that
	// orders.spec.ts covers separately.
	await orderDetailsLink.click();

	await expect(page).toHaveURL(/\/order-details\/.+/);
	await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
	await expect(page.getByText(/^Order# /)).toBeVisible();
	await expect(page.getByText(productName!)).toBeVisible();
});

// Deliberately not requesting the `testUser` fixture (unlike the tests
// above) - this documents that a purchase without an account is a real,
// supported path (see server/routes/orderRouter.ts's POST /orders/no-account),
// not an oversight.
test('a guest can complete checkout and view their order details without an account', async ({ page }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const cart = new CartPage(page);
	const checkout = new CheckoutPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	const productName = await productDetail.heading.textContent();
	await productDetail.addToBag();
	await cart.goto();
	await cart.checkoutLink.click();

	await checkout.pay();

	await page.waitForURL(/\/payment-success/);
	const orderDetailsLink = page.getByRole('link', { name: 'View or manage order' });
	await expect(orderDetailsLink).toBeVisible();

	await orderDetailsLink.click();

	await expect(page).toHaveURL(/\/order-details\/.+/);
	await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
	await expect(page.getByText(/^Order# /)).toBeVisible();
	// Confirm it's specifically the item that was purchased, not just any order.
	await expect(page.getByText(productName!)).toBeVisible();
});

test('a declined card shows a payment error and does not complete checkout', async ({ page, testUser: _testUser }) => {
	const productList = new ProductListPage(page);
	const productDetail = new ProductDetailPage(page);
	const cart = new CartPage(page);
	const checkout = new CheckoutPage(page);

	await productList.goto();
	await productList.openFirstProduct();
	await addToBagAndSync(page, productDetail);
	await cart.goto();
	await cart.checkoutLink.click();

	// Stripe's standard published test card for a generic decline.
	await checkout.pay('4000000000000002');

	await expect(checkout.alert).toBeVisible();
	await expect(page).toHaveURL(/\/payment/);
	await expect(checkout.payNowButton).toBeVisible();
});

// StripeContainer skips creating a payment intent entirely when the cart is
// empty (see client/src/components/StripeContainer.tsx) and redirects home
// instead of rendering a checkout form with nothing to pay for.
test('navigating to checkout with an empty cart redirects home', async ({ page }) => {
	await page.goto('/payment');

	await expect(page).toHaveURL('/');
});

// A real double-submit (double-click, network retry, back-button resubmit)
// could otherwise double-charge a customer. server/routes/orderRouter.ts
// guards against this by looking up an existing order with the same
// paymentIntentID before creating a new one. A genuine UI double-click is
// inherently timing-flaky to force reliably (the Pay button disables on
// click), so this fires the same real request at the real backend twice
// concurrently instead - still the real server and real database, just
// driven via requests rather than mouse clicks, which is what actually
// proves the dedupe guard works under a real race.
test('double-submitting the same order does not create a duplicate', async ({ page }) => {
	const paymentIntentID = `pi_e2e_dedupe_test_${Date.now()}`;
	const orderPayload = {
		products: [{ productID: 'e2e-test-product', quantity: 1, size: 'M 8 / W 9.5', retailPrice: 100 }],
		amount: 100,
		card: { brand: 'visa', last4: '4242' },
		billingDetails: { name: 'E2E Dedupe Tester' },
		paymentIntentID,
		orderDate: new Date().toString(),
		deliveryDate: new Date().toString(),
	};

	const [response1, response2] = await Promise.all([
		page.request.post('http://localhost:8888/orders/no-account', { data: orderPayload }),
		page.request.post('http://localhost:8888/orders/no-account', { data: orderPayload }),
	]);
	const [body1, body2] = await Promise.all([response1.json(), response2.json()]);

	const results = [body1, body2];
	const created = results.filter((body) => body.order);
	const duplicates = results.filter((body) => body.error === 'Already ordered');

	expect(created).toHaveLength(1);
	expect(duplicates).toHaveLength(1);
	expect(duplicates[0].orderID).toBe(created[0].order._id);
});
