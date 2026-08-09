import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import ShoppingCartModal from './ShoppingCartModal';

beforeEach(() => localStorage.clear());

it('closes when the close button is clicked', async () => {
	const setShowModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={setShowModal} />);

	await user.click(screen.getByRole('button', { name: /close/i }));

	expect(setShowModal).toHaveBeenCalledWith(false);
});

it('shows the last-added shoe when the cart has an item', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 130 }] })
	);
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={vi.fn()} />);

	expect(await screen.findByText('Air Max 1')).toBeInTheDocument();
	expect(screen.getByText('$130')).toBeInTheDocument();
});

it('does not render shoe details when the cart is empty', () => {
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={vi.fn()} />);

	expect(screen.queryByText(/size/i)).not.toBeInTheDocument();
});

it('shows the cart item count in the View Bag link', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({
			products: [
				{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 130 },
				{ _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 110 },
			],
		})
	);
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={vi.fn()} />);

	expect(await screen.findByRole('link', { name: 'View Bag (2)' })).toBeInTheDocument();
});

it('navigates to /cart and closes the modal when View Bag is clicked', async () => {
	const setShowModal = vi.fn();
	const user = userEvent.setup();
	const { history } = renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={setShowModal} />);

	await user.click(screen.getByRole('link', { name: /view bag/i }));

	expect(setShowModal).toHaveBeenCalledWith(false);
	expect(history.location.pathname).toBe('/cart');
});

it('navigates to /payment and closes the modal when Checkout is clicked', async () => {
	const setShowModal = vi.fn();
	const user = userEvent.setup();
	const { history } = renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={setShowModal} />);

	await user.click(screen.getByRole('link', { name: /checkout/i }));

	expect(setShowModal).toHaveBeenCalledWith(false);
	expect(history.location.pathname).toBe('/payment');
});

it('closes the modal when the backdrop is clicked', async () => {
	const setShowModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={setShowModal} />);
	const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;

	await user.click(backdrop);

	expect(setShowModal).toHaveBeenCalledWith(false);
});

it('does not close the modal when clicking inside the dialog', async () => {
	const setShowModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={setShowModal} />);

	await user.click(screen.getByRole('dialog'));

	expect(setShowModal).not.toHaveBeenCalled();
});

it('closes the modal when Escape is pressed', async () => {
	const setShowModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<ShoppingCartModal showModal={true} setShowModal={setShowModal} />);

	await user.keyboard('{Escape}');

	expect(setShowModal).toHaveBeenCalledWith(false);
});
