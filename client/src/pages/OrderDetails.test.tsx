import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser, makeShoe } from '../test-fixtures';
import { RootState } from '../redux/store';
import OrderDetails from './OrderDetails';

const API_URL = import.meta.env.VITE_API_URL;

const renderOrderDetails = (orderId: string, preloadedState?: Partial<RootState>) =>
	renderWithProviders(
		<Route path="/order-details/:id">
			<OrderDetails />
		</Route>,
		{ route: `/order-details/${orderId}`, preloadedState }
	);

it('renders the order number and payment method for a valid order', async () => {
	renderOrderDetails('order-1');

	expect(await screen.findByText('Order# order-1')).toBeInTheDocument();
	expect(screen.getByText('VISA **** 4242')).toBeInTheDocument();
});

it('shows "Guest" as the shipping name when the order has no associated user', async () => {
	server.use(
		http.get(`${API_URL}/orders/:orderId`, ({ params }) =>
			HttpResponse.json({
				_id: params.orderId,
				userID: undefined,
				amount: 130,
				orderDate: new Date().toString(),
				createdAt: new Date().toISOString(),
				products: [{ _id: 'p1', productID: 'air-max-1', size: '10', quantity: 1, retailPrice: 130 }],
				card: { brand: 'visa', last4: '4242' },
				billingDetails: {
					address: { city: '', country: 'US', line1: '', line2: '', postal_code: '10001', state: '' },
				},
			})
		)
	);

	renderOrderDetails('guest-order-1');

	expect(await screen.findByText('Guest')).toBeInTheDocument();
});

it('redirects to /orders when the order fetch errors for a logged-in user', async () => {
	server.use(http.get(`${API_URL}/orders/:orderId`, () => HttpResponse.json('Not found', { status: 404 })));

	const { history } = renderOrderDetails('missing-order', {
		user: { currentUser: makeAuthUser(), isFetching: false, error: false },
	});

	await waitFor(() => expect(history.location.pathname).toBe('/orders'));
});

it('redirects to / when the order fetch errors for a guest', async () => {
	server.use(http.get(`${API_URL}/orders/:orderId`, () => HttpResponse.json('Not found', { status: 404 })));

	const { history } = renderOrderDetails('missing-order');

	await waitFor(() => expect(history.location.pathname).toBe('/'));
});

it("renders the ordered shoe's name, size, and quantity", async () => {
	server.use(
		http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json([makeShoe({ shoeID: 'air-max-1', name: 'Air Max 1', retailPrice: 130 })]))
	);

	renderOrderDetails('order-1');

	expect(await screen.findByRole('link', { name: 'Air Max 1' })).toBeInTheDocument();
	// "Size:"/"Quantity:" are their own <span>, splitting the text across elements -
	// a plain string matcher can't join them, so match on the parent's full text instead.
	expect(screen.getByText((_, el) => el?.textContent === 'Size: 10')).toBeInTheDocument();
	expect(screen.getByText((_, el) => el?.textContent === 'Quantity: 1')).toBeInTheDocument();
});

it("excludes a product from the item list when its shoe can't be found", async () => {
	// The default POST /shoes/bulk handler returns [], so the order's one product
	// ('air-max-1') never matches anything in shoeLookup.
	renderOrderDetails('order-1');

	await screen.findByText('Order# order-1');
	expect(screen.queryByRole('link', { name: /air max/i })).not.toBeInTheDocument();
});

it('renders a separate line item for each product even when they share the same shoe', async () => {
	server.use(
		http.get(`${API_URL}/orders/:orderId`, ({ params }) =>
			HttpResponse.json({
				_id: params.orderId,
				userID: 'user-1',
				amount: 260,
				orderDate: new Date().toString(),
				createdAt: new Date().toISOString(),
				products: [
					{ _id: 'p1', productID: 'air-max-1', size: '9', quantity: 1, retailPrice: 130 },
					{ _id: 'p2', productID: 'air-max-1', size: '10', quantity: 1, retailPrice: 130 },
				],
				card: { brand: 'visa', last4: '4242' },
				billingDetails: { address: { city: '', country: 'US', line1: '', line2: '', postal_code: '10001', state: '' } },
			})
		),
		http.post(`${API_URL}/shoes/bulk`, () => HttpResponse.json([makeShoe({ shoeID: 'air-max-1', name: 'Air Max 1', retailPrice: 130 })]))
	);

	renderOrderDetails('order-1');

	expect(await screen.findByText((_, el) => el?.textContent === 'Size: 9')).toBeInTheDocument();
	expect(screen.getByText((_, el) => el?.textContent === 'Size: 10')).toBeInTheDocument();
});
