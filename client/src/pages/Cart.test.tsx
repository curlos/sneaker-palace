import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import Cart from './Cart';

const API_URL = import.meta.env.VITE_API_URL;

beforeEach(() => localStorage.clear());

it('shows an empty-bag message with a link to continue shopping when the guest cart has no products', async () => {
	renderWithProviders(<Cart />);

	expect(await screen.findByText('Your bag is empty.')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /continue shopping/i })).toHaveAttribute('href', '/shoes');
});

it('does not render the Summary panel when the guest cart is empty', async () => {
	renderWithProviders(<Cart />);

	await screen.findByText('Your bag is empty.');

	expect(screen.queryByText('Subtotal')).not.toBeInTheDocument();
	expect(screen.queryByRole('link', { name: /checkout/i })).not.toBeInTheDocument();
});

it("shows an empty-bag message when a logged-in user's cart has no products", async () => {
	server.use(http.get(`${API_URL}/cart`, () => HttpResponse.json({ _id: 'cart-1', products: [] })));

	renderWithProviders(<Cart />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByText('Your bag is empty.')).toBeInTheDocument();
});

it('renders the checkout link and correct Subtotal/Total for a guest cart with items', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);

	renderWithProviders(<Cart />);

	expect(await screen.findByRole('link', { name: /checkout/i })).toHaveAttribute('href', '/payment');
	expect(screen.getAllByText('$200.00').length).toBeGreaterThanOrEqual(2);
});

it("renders the correct Subtotal/Total for a logged-in user's cart with items", async () => {
	renderWithProviders(<Cart />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	await screen.findByRole('link', { name: /checkout/i });

	expect(screen.getAllByText('$200.00').length).toBeGreaterThanOrEqual(2);
});

it('renders one row per product for a multi-item guest cart', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({
			products: [
				{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 },
				{ _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 50 },
			],
		})
	);

	renderWithProviders(<Cart />);

	expect(await screen.findAllByRole('button', { name: /remove/i })).toHaveLength(2);
});

it('sums retailPrice times quantity across products for the Subtotal/Total of a multi-item guest cart', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({
			products: [
				{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 },
				{ _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 50 },
			],
		})
	);

	renderWithProviders(<Cart />);

	expect(await screen.findAllByText('$250.00')).toHaveLength(2);
});

it('shows the fixed shipping and tax lines when the cart has items', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);

	renderWithProviders(<Cart />);

	expect(await screen.findByText('Estimated Shipping & Handling')).toBeInTheDocument();
	expect(screen.getByText('Estimated Tax')).toBeInTheDocument();
});

it("updates the Subtotal/Total after a cart item's quantity changes", async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);
	const user = userEvent.setup();
	renderWithProviders(<Cart />);
	await screen.findByLabelText('Quantity');

	await user.selectOptions(screen.getByLabelText('Quantity'), '5');

	expect(await screen.findAllByText('$500.00')).toHaveLength(2);
});

it('shows the empty-bag message again after removing the only item from the cart', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);
	const user = userEvent.setup();
	renderWithProviders(<Cart />);
	await screen.findByRole('button', { name: /remove/i });

	await user.click(screen.getByRole('button', { name: /remove/i }));

	expect(await screen.findByText('Your bag is empty.')).toBeInTheDocument();
});
