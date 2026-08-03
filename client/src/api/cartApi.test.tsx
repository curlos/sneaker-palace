import { http, HttpResponse, delay } from 'msw';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import { useCart, useGetUserCartQuery, useUpdateUserCartMutation, calculateCartTotal } from './cartApi';

it('calculateCartTotal sums quantity times retailPrice across products', () => {
	const total = calculateCartTotal([
		{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 },
		{ _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 50 },
	]);

	expect(total).toBe(250);
});

const API_URL = import.meta.env.VITE_API_URL;

const CartConsumer = () => {
	const { data, isLoading, error } = useCart();
	if (isLoading) return <div>Loading</div>;
	if (error) return <div>Failed to load cart</div>;
	return <div data-testid="cart-total">{data?.total ?? 0}</div>;
};

const newProduct = { _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 50 };

const CartMutationConsumer = () => {
	const { data, isLoading } = useGetUserCartQuery();
	const [updateCart] = useUpdateUserCartMutation();
	if (isLoading) return <div>Loading</div>;
	return (
		<div>
			<div data-testid="cart-total">{data?.total ?? 0}</div>
			<button onClick={() => updateCart({ products: [newProduct] })}>Update</button>
		</div>
	);
};

beforeEach(() => localStorage.clear());

it('reads the guest cart from localStorage when no user is logged in', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);

	renderWithProviders(<CartConsumer />);

	expect(await screen.findByTestId('cart-total')).toHaveTextContent('200');
});

it('fetches the server cart when a user is logged in', async () => {
	renderWithProviders(<CartConsumer />, { preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } } });

	expect(await screen.findByTestId('cart-total')).toHaveTextContent('200');
});

it('falls back to an empty cart when localStorage has corrupted JSON', async () => {
	localStorage.setItem('currentCart', 'not valid json{');

	renderWithProviders(<CartConsumer />);

	expect(await screen.findByTestId('cart-total')).toHaveTextContent('0');
});

it('surfaces an error when the server cart request fails', async () => {
	server.use(http.get(`${API_URL}/cart`, () => HttpResponse.json('Server error', { status: 500 })));

	renderWithProviders(<CartConsumer />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByText('Failed to load cart')).toBeInTheDocument();
});

it('optimistically updates the cart total before the server responds', async () => {
	server.use(
		http.put(`${API_URL}/cart`, async ({ request }) => {
			await delay(50);
			const body = (await request.json()) as { products: unknown[] };
			return HttpResponse.json({ _id: 'cart-1', userID: makeAuthUser()._id, products: body.products });
		})
	);

	renderWithProviders(<CartMutationConsumer />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByTestId('cart-total')).toHaveTextContent('200');

	await userEvent.click(screen.getByText('Update'));

	expect(screen.getByTestId('cart-total')).toHaveTextContent('50');
});

it('rolls back the optimistic update when the server request fails', async () => {
	renderWithProviders(<CartMutationConsumer />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByTestId('cart-total')).toHaveTextContent('200');

	server.use(http.put(`${API_URL}/cart`, () => HttpResponse.json('Server error', { status: 500 })));

	await userEvent.click(screen.getByText('Update'));

	await waitFor(() => expect(screen.getByTestId('cart-total')).toHaveTextContent('200'));
});
