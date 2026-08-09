import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { renderWithProviders, screen } from '../test-utils';
import { server } from '../mocks/server';
import { makeShoe } from '../test-fixtures';
import CheckoutForm from './CheckoutForm';

const API_URL = import.meta.env.VITE_API_URL;

const { useStripeMock, useElementsMock, confirmPayment, retrievePaymentIntent } = vi.hoisted(() => ({
	useStripeMock: vi.fn(),
	useElementsMock: vi.fn(),
	confirmPayment: vi.fn(),
	retrievePaymentIntent: vi.fn(),
}));

vi.mock('@stripe/react-stripe-js', () => ({
	useStripe: useStripeMock,
	useElements: useElementsMock,
	PaymentElement: () => <div>Payment Element</div>,
}));

beforeEach(() => {
	localStorage.clear();
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 }] })
	);
	confirmPayment.mockReset();
	retrievePaymentIntent.mockReset().mockResolvedValue({ paymentIntent: null });
	useStripeMock.mockReturnValue({ confirmPayment, retrievePaymentIntent });
	useElementsMock.mockReturnValue({});
	// Mirrors the default GET /shoes/:shoeID handler's behavior (always "Air Max 1", regardless
	// of which ID was requested), just for the bulk endpoint CheckoutForm now uses instead.
	server.use(
		http.post(`${API_URL}/shoes/bulk`, async ({ request }) => {
			const body = (await request.json()) as { ids: string[] };
			return HttpResponse.json(body.ids.map((id) => makeShoe({ shoeID: id, name: 'Air Max 1', retailPrice: 130 })));
		})
	);
});

it('shows the cart total', async () => {
	renderWithProviders(<CheckoutForm />);

	expect((await screen.findAllByText('$200.00')).length).toBeGreaterThan(0);
});

it('shows the error message when Stripe declines the card', async () => {
	confirmPayment.mockResolvedValue({ error: { type: 'card_error', message: 'Your card was declined.' } });
	const user = userEvent.setup();
	renderWithProviders(<CheckoutForm />);

	await user.click(screen.getByRole('button', { name: /pay now/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('Your card was declined.');
});

it('disables the submit button until Stripe elements finish loading', async () => {
	useElementsMock.mockReturnValue(null);
	renderWithProviders(<CheckoutForm />);

	expect(await screen.findByRole('button', { name: /pay now/i })).toBeDisabled();
});

const paymentIntentStatusCases: Array<[string, string]> = [
	['succeeded', 'Payment succeeded!'],
	['processing', 'Your payment is processing.'],
	['requires_payment_method', 'Your payment was not successful, please try again.'],
	['unknown_status', 'Something went wrong.'],
];

it.each(paymentIntentStatusCases)(
	'shows the right message for a returning payment intent with status "%s"',
	async (status, expectedMessage) => {
		window.history.pushState({}, '', '/payment?payment_intent_client_secret=pi_123_secret_abc');
		retrievePaymentIntent.mockResolvedValue({ paymentIntent: { status } });
		renderWithProviders(<CheckoutForm />);

		expect(await screen.findByRole('alert')).toHaveTextContent(expectedMessage);
	}
);

it('shows a generic error message for a non-card Stripe error', async () => {
	confirmPayment.mockResolvedValue({ error: { type: 'api_error', message: 'Something on our end broke.' } });
	const user = userEvent.setup();
	renderWithProviders(<CheckoutForm />);

	await user.click(screen.getByRole('button', { name: /pay now/i }));

	expect(await screen.findByRole('alert')).toHaveTextContent('An unexpected error occured.');
});

it('disables the submit button and shows a loading spinner while the payment is being confirmed', async () => {
	let resolveConfirmPayment: (value: { error: { type: string; message: string } }) => void = () => {};
	confirmPayment.mockImplementation(
		() =>
			new Promise((resolve) => {
				resolveConfirmPayment = resolve;
			})
	);
	const user = userEvent.setup();
	renderWithProviders(<CheckoutForm />);
	await screen.findByText('Air Max 1');

	await user.click(screen.getByRole('button', { name: /pay now/i }));

	expect(screen.getByRole('button')).toBeDisabled();
	expect(screen.getByRole('status')).toBeInTheDocument();

	resolveConfirmPayment({ error: { type: 'card_error', message: 'Your card was declined.' } });
	await screen.findByRole('alert');
});

it('renders the cart product name, size, and quantity for a single-item cart', async () => {
	renderWithProviders(<CheckoutForm />);

	expect(await screen.findByText('Air Max 1')).toBeInTheDocument();
	expect(screen.getByText('Size: 10')).toBeInTheDocument();
	expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
});

it('renders one cart entry per product for a multi-item cart', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({
			products: [
				{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 2, retailPrice: 100 },
				{ _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 50 },
			],
		})
	);
	renderWithProviders(<CheckoutForm />);

	expect(await screen.findAllByText('Air Max 1')).toHaveLength(2);
});

it('shows the static Estimated Shipping and Estimated Tax lines as $0.00', async () => {
	renderWithProviders(<CheckoutForm />);

	await screen.findByText('Air Max 1');

	expect(screen.getByText('Estimated Shipping').nextSibling).toHaveTextContent('$0.00');
	expect(screen.getByText('Estimated Tax').nextSibling).toHaveTextContent('$0.00');
});

it('shows a loading indicator while shoe data is being fetched', async () => {
	server.use(
		http.post(`${API_URL}/shoes/bulk`, async () => {
			await delay(50);
			return HttpResponse.json([makeShoe({ shoeID: 'shoe-1', name: 'Air Max 1', retailPrice: 130 })]);
		})
	);
	renderWithProviders(<CheckoutForm />);

	// The bulk shoes query is skipped until the cart itself has loaded (there are no product
	// IDs to fetch yet), so the spinner doesn't necessarily appear on the very first render.
	expect(await screen.findByRole('status')).toBeInTheDocument();

	await screen.findByText('Air Max 1');

	expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
