import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { makeAuthUser } from '../test-fixtures';
import PaymentSuccess from './PaymentSuccess';

const API_URL = import.meta.env.VITE_API_URL;

const { useStripeMock, retrievePaymentIntent } = vi.hoisted(() => ({
	useStripeMock: vi.fn(),
	retrievePaymentIntent: vi.fn(),
}));

vi.mock('@stripe/react-stripe-js', () => ({
	useStripe: useStripeMock,
}));

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);
	retrievePaymentIntent.mockReset().mockResolvedValue({
		paymentIntent: { payment_method: 'pm_123', status: 'succeeded', id: 'pi_123' },
	});
	useStripeMock.mockReturnValue({ retrievePaymentIntent });
	window.history.pushState({}, '', '/payment-success?payment_intent_client_secret=pi_123_secret_abc');
});

it('shows a loading spinner while the order is being created', () => {
	renderWithProviders(<PaymentSuccess />);

	expect(screen.getByRole('status')).toBeInTheDocument();
});

it('shows the guest success message and order link once checkout completes', async () => {
	renderWithProviders(<PaymentSuccess />);

	expect(await screen.findByText('Hello Guest,')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /view or manage order/i })).toHaveAttribute(
		'href',
		'/order-details/order-guest-1'
	);
});

it('creates an order for the logged-in user and greets them by name', async () => {
	renderWithProviders(<PaymentSuccess />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByText('Hello Test,')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /view or manage order/i })).toHaveAttribute(
		'href',
		'/order-details/order-user-1'
	);
});

it('still shows the order-details link when the order already exists (e.g. a duplicate/retried submission)', async () => {
	// This is the only real "soft-fail" shape the backend sends (orderRouter.ts's paymentIntentID
	// dedup check) - it's not actually a failure, just confirmation that a valid order exists.
	server.use(
		http.post(`${API_URL}/orders/no-account`, () =>
			HttpResponse.json({ error: 'Already ordered', orderID: 'attempted-order-1' })
		)
	);

	renderWithProviders(<PaymentSuccess />);

	expect(await screen.findByText('Hello Guest,')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /view or manage order/i })).toHaveAttribute(
		'href',
		'/order-details/attempted-order-1'
	);
});

it('shows a failure message and no order link when order creation fails even after retries', async () => {
	server.use(
		http.post(`${API_URL}/orders/no-account`, () => HttpResponse.json({ error: 'Server error' }, { status: 500 }))
	);

	renderWithProviders(<PaymentSuccess />);

	// Real exponential backoff (maxRetries: 2) can take longer than findBy's default 1000ms poll.
	expect(await screen.findByRole('alert', {}, { timeout: 8000 })).toHaveTextContent(
		"Payment succeeded, but we couldn't confirm your order. Please contact support."
	);
	expect(screen.queryByRole('link', { name: /view or manage order/i })).not.toBeInTheDocument();
}, 10000);

it('retries and completes the order after a transient failure', async () => {
	let attempts = 0;
	server.use(
		http.post(`${API_URL}/orders/no-account`, () => {
			attempts++;
			if (attempts === 1) {
				return HttpResponse.json({ error: 'Server error' }, { status: 500 });
			}
			return HttpResponse.json({ order: { _id: 'order-after-retry' } });
		})
	);

	renderWithProviders(<PaymentSuccess />);

	expect(await screen.findByRole('link', { name: /view or manage order/i })).toHaveAttribute(
		'href',
		'/order-details/order-after-retry'
	);
}, 10000);

it('exits the loading spinner with a broken order link when the cart is empty on load', async () => {
	localStorage.setItem('currentCart', JSON.stringify({ products: [] }));

	renderWithProviders(<PaymentSuccess />);

	expect(await screen.findByText('Hello Guest,')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /view or manage order/i })).toHaveAttribute('href', '/order-details/');
});

it('exits the loading spinner with a broken order link when there is no payment intent in the URL', async () => {
	window.history.pushState({}, '', '/payment-success');

	renderWithProviders(<PaymentSuccess />);

	expect(await screen.findByText('Hello Guest,')).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /view or manage order/i })).toHaveAttribute('href', '/order-details/');
});
