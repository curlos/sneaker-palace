import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import Orders from './Orders';

const API_URL = import.meta.env.VITE_API_URL;

const makeOrder = (overrides: Record<string, unknown> = {}) => ({
	_id: 'order-1',
	userID: 'user-1',
	amount: 130,
	orderDate: new Date().toString(),
	createdAt: new Date().toISOString(),
	products: [{ _id: 'p1', productID: 'air-max-1', size: '10', quantity: 1, retailPrice: 130 }],
	card: { brand: 'visa', last4: '4242' },
	billingDetails: { address: { city: '', country: 'US', line1: '', line2: '', postal_code: '', state: '' } },
	...overrides,
});

const renderOrders = () =>
	renderWithProviders(<Orders />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

it('shows "No orders found" for a guest', async () => {
	renderWithProviders(<Orders />);

	expect(await screen.findByText('No orders found')).toBeInTheDocument();
});

it('renders the order number for a logged-in user with orders', async () => {
	renderOrders();

	expect(await screen.findByText('ORDER #order-1')).toBeInTheDocument();
});

it('shows "No orders found" when every order has an empty products array', async () => {
	server.use(http.get(`${API_URL}/orders/user`, () => HttpResponse.json([makeOrder({ _id: 'empty-order-1', products: [] })])));

	renderOrders();

	expect(await screen.findByText('No orders found')).toBeInTheDocument();
});

it('sorts orders with the most recent first', async () => {
	server.use(
		http.get(`${API_URL}/orders/user`, () =>
			HttpResponse.json([
				makeOrder({ _id: 'order-older', createdAt: '2024-01-01T00:00:00.000Z' }),
				makeOrder({ _id: 'order-newer', createdAt: '2024-06-01T00:00:00.000Z' }),
			])
		)
	);

	renderOrders();

	const orderHeadings = await screen.findAllByText(/^ORDER #/);
	expect(orderHeadings.map((el) => el.textContent)).toEqual(['ORDER #order-newer', 'ORDER #order-older']);
});

it('excludes orders with no products from a mixed list', async () => {
	server.use(
		http.get(`${API_URL}/orders/user`, () =>
			HttpResponse.json([makeOrder({ _id: 'order-empty', products: [] }), makeOrder({ _id: 'order-valid' })])
		)
	);

	renderOrders();

	expect(await screen.findByText('ORDER #order-valid')).toBeInTheDocument();
	expect(screen.queryByText('ORDER #order-empty')).not.toBeInTheDocument();
});

it('paginates orders when there are more than one page of results', async () => {
	Element.prototype.scrollIntoView = vi.fn();
	const orders = Array.from({ length: 11 }, (_, i) =>
		makeOrder({ _id: `order-${i + 1}`, createdAt: new Date(2024, 0, i + 1).toISOString() })
	);
	server.use(http.get(`${API_URL}/orders/user`, () => HttpResponse.json(orders)));
	const user = userEvent.setup();
	renderOrders();
	await screen.findByText('ORDER #order-11');
	expect(screen.queryByText('ORDER #order-1')).not.toBeInTheDocument();

	await user.click(screen.getByRole('button', { name: /next page/i }));

	expect(await screen.findByText('ORDER #order-1')).toBeInTheDocument();
});

it('links "Order shoes" to /shoes when there are no orders', async () => {
	renderWithProviders(<Orders />);
	await screen.findByText('No orders found');

	expect(screen.getByRole('link', { name: /order shoes/i })).toHaveAttribute('href', '/shoes');
});
