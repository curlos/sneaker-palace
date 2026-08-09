import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { makeAuthUser } from '../test-fixtures';
import SidenavModal from './SidenavModal';

it('closes when Escape is pressed', async () => {
	const setShowSidenavModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={setShowSidenavModal} />);
	await screen.findByText('Sneakers');

	await user.keyboard('{Escape}');

	expect(setShowSidenavModal).toHaveBeenCalledWith(false);
});

it('logs the user out, closes the modal, and navigates home when "Sign Out" is clicked', async () => {
	const setShowSidenavModal = vi.fn();
	const user = userEvent.setup();
	const { store, history } = renderWithProviders(
		<SidenavModal showSidenavModal={true} setShowSidenavModal={setShowSidenavModal} />,
		{ route: '/settings', preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } } }
	);
	await screen.findByRole('link', { name: /sign out/i });

	await user.click(screen.getByRole('link', { name: /sign out/i }));

	expect(setShowSidenavModal).toHaveBeenCalledWith(false);
	expect(store.getState().user.currentUser).toBeNull();
	await waitFor(() => expect(history.location.pathname).toBe('/'));
});

it('closes the modal when the backdrop is clicked', async () => {
	const setShowSidenavModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={setShowSidenavModal} />);
	const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;

	await user.click(backdrop);

	expect(setShowSidenavModal).toHaveBeenCalledWith(false);
});

it('does not close the modal when clicking inside the dialog', async () => {
	const setShowSidenavModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={setShowSidenavModal} />);

	await user.click(screen.getByRole('dialog'));

	expect(setShowSidenavModal).not.toHaveBeenCalled();
});

it.each([
	{ name: 'Sneakers', href: '/shoes' },
	{ name: 'Men', href: '/shoes?genders=men' },
	{ name: 'Women', href: '/shoes?genders=women' },
	{ name: 'Youth', href: '/shoes?genders=youth' },
	{ name: 'Infant', href: '/shoes?genders=infant' },
	{ name: 'Jordan', href: '/shoes?brands=Jordan,Air%20Jordan' },
	{ name: 'Nike', href: '/shoes?brands=Nike' },
	{ name: 'Adidas', href: '/shoes?brands=adidas' },
])('links $name to $href', ({ name, href }) => {
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={vi.fn()} />);

	expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
});

it('closes the modal when a nav link is clicked', async () => {
	const setShowSidenavModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={setShowSidenavModal} />);

	await user.click(screen.getByRole('link', { name: 'Sneakers' }));

	expect(setShowSidenavModal).toHaveBeenCalledWith(false);
});

it.each(['Login', 'Register'])('shows the %s link when no user is logged in', (name) => {
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={vi.fn()} />);

	expect(screen.getByRole('link', { name })).toBeInTheDocument();
});

it.each(['Profile', 'Orders', 'Settings', 'Sign Out'])('does not show the %s link when no user is logged in', (name) => {
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={vi.fn()} />);

	expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
});

it.each(['Profile', 'Orders', 'Settings', 'Sign Out'])('shows the %s link when a user is logged in', async (name) => {
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={vi.fn()} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByRole('link', { name })).toBeInTheDocument();
});

it.each(['Login', 'Register'])('does not show the %s link when a user is logged in', async (name) => {
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={vi.fn()} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});
	await screen.findByRole('link', { name: /sign out/i });

	expect(screen.queryByRole('link', { name })).not.toBeInTheDocument();
});

it('links Profile to the logged-in user\'s profile page', async () => {
	renderWithProviders(<SidenavModal showSidenavModal={true} setShowSidenavModal={vi.fn()} />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

	expect(await screen.findByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile/user-1');
});
