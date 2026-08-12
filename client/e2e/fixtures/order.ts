import { test as authTest } from './auth';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { TestUser } from '../utils/testUser';
import { addToBagAndSync } from '../utils/cart';

export interface CompletedOrder {
	user: TestUser;
	shoeName: string;
}

export const test = authTest.extend<{ completedOrder: CompletedOrder }>({
	completedOrder: async ({ page, testUser }, use) => {
		const productList = new ProductListPage(page);
		await productList.goto();
		await productList.openFirstProduct();

		const productDetail = new ProductDetailPage(page);
		const shoeName = (await productDetail.heading.textContent()) as string;
		await addToBagAndSync(page, productDetail);

		const cart = new CartPage(page);
		await cart.goto();
		await cart.checkoutLink.click();

		const checkout = new CheckoutPage(page);
		await checkout.pay();
		await page.waitForURL(/\/payment-success/);

		// PaymentSuccess creates the order asynchronously after the redirect; this
		// link only renders once that's done, so wait for it before moving on.
		await page.getByRole('link', { name: 'View or manage order' }).waitFor();

		await use({ user: testUser, shoeName });
	},
});

export { expect } from '@playwright/test';
