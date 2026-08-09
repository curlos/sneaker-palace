import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { mockAuthUser } from '../mocks/handlers';
import { server } from '../mocks/server';
import Register from './Register';

const API_URL = import.meta.env.VITE_API_URL;

const renderRegister = () => renderWithProviders(<Register />, { route: '/register' });

beforeEach(() => localStorage.clear());

const fillAndSubmit = async (email: string) => {
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(/email address/i), email);
	await user.type(screen.getByLabelText(/^password/i), 'correct-password');
	await user.type(screen.getByLabelText(/first name/i), 'Test');
	await user.type(screen.getByLabelText(/last name/i), 'User');
	await user.click(screen.getByRole('button', { name: /sign up/i }));
};

const clearAndFillAndSubmit = async (email: string) => {
	const user = userEvent.setup();
	await user.clear(screen.getByLabelText(/email address/i));
	await user.clear(screen.getByLabelText(/^password/i));
	await user.clear(screen.getByLabelText(/first name/i));
	await user.clear(screen.getByLabelText(/last name/i));
	await fillAndSubmit(email);
};

it('registers and logs the user in, redirecting home', async () => {
	const { store, history } = renderRegister();

	await fillAndSubmit(mockAuthUser.email);

	await waitFor(() => expect(history.location.pathname).toBe('/'));
	expect(store.getState().user.currentUser).toEqual(mockAuthUser);
});

it('shows the server error message when the email is already taken', async () => {
	renderRegister();

	await fillAndSubmit('taken@example.com');

	expect(await screen.findByRole('alert')).toHaveTextContent('Email taken');
});

it('requires all four fields to be filled in', () => {
	renderRegister();

	expect(screen.getByLabelText(/email address/i)).toBeRequired();
	expect(screen.getByLabelText(/^password/i)).toBeRequired();
	expect(screen.getByLabelText(/first name/i)).toBeRequired();
	expect(screen.getByLabelText(/last name/i)).toBeRequired();
});

it('clears the guest cart on successful registration', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({ products: [{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }] })
	);
	renderRegister();

	await fillAndSubmit(mockAuthUser.email);

	await waitFor(() => {
		const cart = JSON.parse(localStorage.getItem('currentCart') || '{}');
		expect(cart.products).toHaveLength(0);
	});
});

it('marks all inputs as invalid after a failed registration', async () => {
	renderRegister();

	await fillAndSubmit('taken@example.com');
	await screen.findByRole('alert');

	expect(screen.getByLabelText(/email address/i)).toHaveAttribute('aria-invalid', 'true');
	expect(screen.getByLabelText(/^password/i)).toHaveAttribute('aria-invalid', 'true');
	expect(screen.getByLabelText(/first name/i)).toHaveAttribute('aria-invalid', 'true');
	expect(screen.getByLabelText(/last name/i)).toHaveAttribute('aria-invalid', 'true');
});

it('shows a generic error message when registration fails without a backend error message', async () => {
	server.use(http.post(`${API_URL}/auth/register`, () => HttpResponse.json({}, { status: 500 })));
	renderRegister();

	await fillAndSubmit(mockAuthUser.email);

	expect(await screen.findByRole('alert')).toHaveTextContent('Registration failed. Please try again.');
});

it('clears the previous error when retrying with a new email', async () => {
	renderRegister();

	await fillAndSubmit('taken@example.com');
	await screen.findByRole('alert');

	await clearAndFillAndSubmit(mockAuthUser.email);

	await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});

it('navigates to the login page when clicking log in', async () => {
	const { history } = renderRegister();
	const user = userEvent.setup();

	await user.click(screen.getByRole('link', { name: /log in/i }));

	expect(history.location.pathname).toBe('/login');
});
