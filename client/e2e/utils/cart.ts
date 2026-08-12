import { Page } from '@playwright/test';
import { ProductDetailPage } from '../pages/ProductDetailPage';

/**
 * For logged-in users, "Add to Bag" writes to the server (PUT /cart), but the
 * UI updates optimistically before that request resolves. Navigating away
 * (e.g. to /cart) right after can cancel the still-in-flight request, so the
 * write never lands. Wait for the actual response before moving on.
 *
 * Guest carts write to localStorage synchronously and never hit this
 * endpoint, so this is only needed for authenticated flows.
 */
export async function addToBagAndSync(page: Page, productDetail: ProductDetailPage) {
	const cartSynced = page.waitForResponse(
		(response) => response.url().includes('/cart') && response.request().method() === 'PUT'
	);
	await productDetail.addToBag();
	await cartSynced;
}
