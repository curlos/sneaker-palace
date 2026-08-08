import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { makeAuthUser } from '../test-fixtures';
import Navbar from './Navbar';

beforeEach(() => localStorage.clear());

const renderNavbar = (preloadedState?: Parameters<typeof renderWithProviders>[1]) =>
	renderWithProviders(<Navbar setShowSearchModal={vi.fn()} setShowSidenavModal={vi.fn()} />, preloadedState);

it('shows the number of products in the cart', async () => {
	localStorage.setItem(
		'currentCart',
		JSON.stringify({
			products: [
				{ _id: 'p1', productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 },
				{ _id: 'p2', productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 100 },
			],
		})
	);

	renderNavbar();

	expect(await screen.findByText('2')).toBeInTheDocument();
});

it('shows Login/Sign Up links when logged out', async () => {
	renderNavbar();

	expect(await screen.findByRole('link', { name: /login/i })).toBeInTheDocument();
	expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
});

it('shows the account menu instead of Login/Sign Up when logged in', async () => {
	renderNavbar({ preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } } });

	expect(await screen.findByRole('button', { name: /hi, test/i })).toBeInTheDocument();
	expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
});

it('opens the search modal when the search button is clicked', async () => {
	const setShowSearchModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<Navbar setShowSearchModal={setShowSearchModal} setShowSidenavModal={vi.fn()} />);

	await user.click(screen.getByRole('button', { name: /search/i }));

	expect(setShowSearchModal).toHaveBeenCalledWith(true);
});

it('opens the sidenav modal when the menu button is clicked', async () => {
	const setShowSidenavModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<Navbar setShowSearchModal={vi.fn()} setShowSidenavModal={setShowSidenavModal} />);

	await user.click(screen.getByRole('button', { name: /menu/i }));

	expect(setShowSidenavModal).toHaveBeenCalledWith(true);
});

it('logs out when Sign Out is clicked', async () => {
	const user = userEvent.setup();
	renderNavbar({ preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } } });

	await user.click(await screen.findByRole('button', { name: /hi, test/i }));
	await user.click(await screen.findByRole('menuitem', { name: /sign out/i }));

	await waitFor(() => expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument());
});
