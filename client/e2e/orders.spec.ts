import { test, expect } from './fixtures/order';
import { OrdersPage } from './pages/OrdersPage';

test('a completed order appears in order history with the purchased item', async ({ page, completedOrder }) => {
	const orders = new OrdersPage(page);
	await orders.goto();

	await expect(orders.heading).toBeVisible();
	// Confirm it's specifically the item that was purchased, not just any order.
	await expect(page.getByText(completedOrder.shoeName)).toBeVisible();
});

test('order details page shows the purchased item', async ({ page, completedOrder }) => {
	const orders = new OrdersPage(page);
	await orders.goto();
	await orders.viewDetailsLinks.first().click();

	await expect(page).toHaveURL(/\/order-details\/.+/);
	await expect(page.getByRole('heading', { name: 'Order Details' })).toBeVisible();
	await expect(page.getByText(/^Order# /)).toBeVisible();
	await expect(page.getByText(completedOrder.shoeName)).toBeVisible();
});
