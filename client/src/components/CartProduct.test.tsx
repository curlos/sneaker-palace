import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import CartProduct from './CartProduct';

const API_URL = import.meta.env.VITE_API_URL;

const productInfo = { _id: 'p1', productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 130 };

const readGuestCart = () => JSON.parse(localStorage.getItem('currentCart') || '{}');

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem('currentCart', JSON.stringify({ products: [productInfo] }));
});

it('removes the product from the guest cart when "Remove" is clicked', async () => {
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />);
	await screen.findByRole('button', { name: /remove/i });

	await user.click(screen.getByRole('button', { name: /remove/i }));

	expect(readGuestCart().products).toHaveLength(0);
});

it('removes only the targeted product from a multi-item guest cart, leaving the other intact', async () => {
	const otherProduct = { _id: 'p2', productID: 'shoe-2', size: '10', quantity: 1, retailPrice: 150 };
	localStorage.setItem('currentCart', JSON.stringify({ products: [productInfo, otherProduct] }));
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />);
	await screen.findByRole('button', { name: /remove/i });

	await user.click(screen.getByRole('button', { name: /remove/i }));

	expect(readGuestCart().products).toEqual([otherProduct]);
});

it('updates the guest cart when a new quantity is selected', async () => {
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />);
	await screen.findByLabelText('Quantity');

	await user.selectOptions(screen.getByLabelText('Quantity'), '3');

	expect(readGuestCart().products[0].quantity).toBe(3);
});

it('updates the guest cart when a new size is selected', async () => {
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />);
	await screen.findByLabelText('Size');

	await user.selectOptions(screen.getByLabelText('Size'), 'M 9.5 / W 11');

	expect(readGuestCart().products[0].size).toBe('M 9.5 / W 11');
});

it("updates the logged-in user's cart when a new quantity is selected", async () => {
	let capturedBody: { products?: { quantity: number }[] } = {};
	server.use(
		http.put(`${API_URL}/cart`, async ({ request }) => {
			capturedBody = (await request.json()) as { products?: { quantity: number }[] };

			return HttpResponse.json({ _id: 'cart-1', products: capturedBody.products });
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByLabelText('Quantity');

	await user.selectOptions(screen.getByLabelText('Quantity'), '3');

	await waitFor(() => expect(capturedBody.products?.[0].quantity).toBe(3));
});

it('renders the shoe name, gender, and colorway from the shoe query', async () => {
	renderWithProviders(<CartProduct productInfo={productInfo} />);

	expect(await screen.findByText('Air Max 1')).toBeInTheDocument();
	expect(screen.getByText((_, element) => element?.tagName === 'DIV' && element.textContent === "gender's Shoes")).toBeInTheDocument();
	expect(screen.getByText('colorway')).toBeInTheDocument();
});

it('renders the price as retailPrice multiplied by quantity', async () => {
	renderWithProviders(<CartProduct productInfo={{ ...productInfo, quantity: 2 }} />);

	expect(await screen.findByText('$260.00')).toBeInTheDocument();
});

it('links to the shoe detail page', async () => {
	renderWithProviders(<CartProduct productInfo={productInfo} />);

	const links = await screen.findAllByRole('link');

	links.forEach((link) => expect(link).toHaveAttribute('href', `/shoe/${productInfo.productID}`));
});

it('shows a loading skeleton before the shoe data loads', async () => {
	renderWithProviders(<CartProduct productInfo={productInfo} />);

	expect(screen.getByRole('status')).toBeInTheDocument();

	await screen.findByText('Air Max 1');

	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it("removes the product from the logged-in user's cart when \"Remove\" is clicked", async () => {
	let capturedBody: { products?: { _id: string }[] } = {};
	server.use(
		http.put(`${API_URL}/cart`, async ({ request }) => {
			capturedBody = (await request.json()) as { products?: { _id: string }[] };
			return HttpResponse.json({ _id: 'cart-1', products: capturedBody.products });
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByRole('button', { name: /remove/i });

	await user.click(screen.getByRole('button', { name: /remove/i }));

	await waitFor(() => expect(capturedBody.products).toHaveLength(0));
});

it("updates the logged-in user's cart when a new size is selected", async () => {
	let capturedBody: { products?: { size: string }[] } = {};
	server.use(
		http.put(`${API_URL}/cart`, async ({ request }) => {
			capturedBody = (await request.json()) as { products?: { size: string }[] };
			return HttpResponse.json({ _id: 'cart-1', products: capturedBody.products });
		})
	);
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByLabelText('Size');

	await user.selectOptions(screen.getByLabelText('Size'), 'M 9.5 / W 11');

	await waitFor(() => expect(capturedBody.products?.[0].size).toBe('M 9.5 / W 11'));
});

it("logs an error and doesn't crash when the logged-in user's cart update fails", async () => {
	server.use(http.put(`${API_URL}/cart`, () => HttpResponse.json({ message: 'Server error' }, { status: 500 })));
	const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
	const user = userEvent.setup();
	renderWithProviders(<CartProduct productInfo={productInfo} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByLabelText('Quantity');

	await user.selectOptions(screen.getByLabelText('Quantity'), '3');

	await waitFor(() => expect(consoleError).toHaveBeenCalledWith('Failed to update cart quantity:', expect.anything()));

	consoleError.mockRestore();
});

it('does not render a bottom border when isLast is true', async () => {
	const { container } = renderWithProviders(<CartProduct productInfo={productInfo} isLast />);
	await screen.findByRole('button', { name: /remove/i });

	expect(container.firstElementChild).not.toHaveClass('border-b');
});
