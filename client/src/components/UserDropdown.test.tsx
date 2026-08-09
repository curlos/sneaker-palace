import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import { UserDropdown } from './UserDropdown';

it('shows "Hi, {firstName}" when the user has a firstName', () => {
	renderWithProviders(<UserDropdown user={{ firstName: 'Jane', _id: 'user-1' }} handleLogout={vi.fn()} />);

	expect(screen.getByRole('button', { name: 'Hi, Jane' })).toBeInTheDocument();
});

it('falls back to "Account menu" when the user has no firstName', () => {
	renderWithProviders(<UserDropdown user={{ _id: 'user-1' }} handleLogout={vi.fn()} />);

	expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
});

it('does not show menu items before the button is clicked', () => {
	renderWithProviders(<UserDropdown user={{ firstName: 'Jane', _id: 'user-1' }} handleLogout={vi.fn()} />);

	expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
});

it('shows all menu items when the button is clicked', async () => {
	const user = userEvent.setup();
	renderWithProviders(<UserDropdown user={{ firstName: 'Jane', _id: 'user-1' }} handleLogout={vi.fn()} />);

	await user.click(screen.getByRole('button', { name: /hi, jane/i }));

	expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
		'Profile',
		'Orders',
		'Settings',
		'Sign Out',
	]);
});

it.each([
	{ name: 'Profile', href: '/profile/user-1' },
	{ name: 'Orders', href: '/orders' },
	{ name: 'Settings', href: '/settings' },
])('links $name to $href', async ({ name, href }) => {
	const user = userEvent.setup();
	renderWithProviders(<UserDropdown user={{ firstName: 'Jane', _id: 'user-1' }} handleLogout={vi.fn()} />);

	await user.click(screen.getByRole('button', { name: /hi, jane/i }));

	expect(screen.getByRole('menuitem', { name })).toHaveAttribute('href', href);
});

it('calls handleLogout when "Sign Out" is clicked', async () => {
	const handleLogout = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<UserDropdown user={{ firstName: 'Jane', _id: 'user-1' }} handleLogout={handleLogout} />);

	await user.click(screen.getByRole('button', { name: /hi, jane/i }));
	await user.click(screen.getByRole('menuitem', { name: /sign out/i }));

	expect(handleLogout).toHaveBeenCalled();
});

it('closes the menu after an item is selected', async () => {
	const user = userEvent.setup();
	renderWithProviders(<UserDropdown user={{ firstName: 'Jane', _id: 'user-1' }} handleLogout={vi.fn()} />);

	await user.click(screen.getByRole('button', { name: /hi, jane/i }));
	await user.click(screen.getByRole('menuitem', { name: 'Settings' }));

	expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
});
