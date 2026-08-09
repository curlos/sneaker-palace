import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { mockAuthUser } from '../mocks/handlers';
import Login from './Login';

const renderLogin = () => renderWithProviders(<Login />, { route: '/login' });

beforeEach(() => localStorage.clear());

const fillAndSubmit = async (email: string, password: string) => {
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(/email address/i), email);
	await user.type(screen.getByLabelText(/password/i), password);
	await user.click(screen.getByRole('button', { name: /sign in/i }));
};

const clearAndFillAndSubmit = async (email: string, password: string) => {
	const user = userEvent.setup();
	await user.clear(screen.getByLabelText(/email address/i));
	await user.clear(screen.getByLabelText(/password/i));
	await fillAndSubmit(email, password);
};

it('logs the user in and redirects home on valid credentials', async () => {
	const { store, history } = renderLogin();

	await fillAndSubmit(mockAuthUser.email, 'correct-password');

	await waitFor(() => expect(history.location.pathname).toBe('/'));
	expect(store.getState().user.currentUser).toEqual(mockAuthUser);
});

it('shows an error message on invalid credentials', async () => {
	renderLogin();

	await fillAndSubmit(mockAuthUser.email, 'wrong-password');

	expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials!');
});

it('marks the inputs as invalid after a failed login', async () => {
	renderLogin();

	await fillAndSubmit(mockAuthUser.email, 'wrong-password');
	await screen.findByRole('alert');

	expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');
	expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
});

it('requires both email and password to be filled in', () => {
	renderLogin();

	expect(screen.getByLabelText(/email address/i)).toBeRequired();
	expect(screen.getByLabelText(/password/i)).toBeRequired();
});

it('clears the guest cart on successful login', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }] })
	);
	renderLogin();

	await fillAndSubmit(mockAuthUser.email, 'correct-password');

	await waitFor(() => {
		const cart = JSON.parse(localStorage.getItem('currentCart') || '{}');
		expect(cart.products).toHaveLength(0);
	});
});

it('sets error and stops fetching in the store on a failed login', async () => {
	const { store } = renderLogin();

	await fillAndSubmit(mockAuthUser.email, 'wrong-password');

	await waitFor(() => {
		expect(store.getState().user).toMatchObject({ error: true, isFetching: false });
	});
});

it('clears the previous error when retrying with correct credentials', async () => {
	renderLogin();

	await fillAndSubmit(mockAuthUser.email, 'wrong-password');
	await screen.findByRole('alert');

	await clearAndFillAndSubmit(mockAuthUser.email, 'correct-password');

	await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

it('navigates to the register page when clicking sign up', async () => {
	const { history } = renderLogin();
	const user = userEvent.setup();

	await user.click(screen.getByRole('link', { name: /sign up/i }));

	expect(history.location.pathname).toBe('/register');
});
