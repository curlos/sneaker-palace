import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import { makeAuthUser } from '../test-fixtures';
import Settings from './Settings';

const renderSettings = () =>
	renderWithProviders(<Settings />, {
		preloadedState: { user: { currentUser: makeAuthUser(), isFetching: false, error: false } },
	});

it('shows Account Details by default', async () => {
	renderSettings();

	expect(await screen.findByRole('heading', { name: 'Account Details' })).toBeInTheDocument();
});

it('switches to Shop Preferences when that tab is clicked', async () => {
	const user = userEvent.setup();
	renderSettings();
	await screen.findByRole('heading', { name: 'Account Details' });

	await user.click(screen.getByRole('tab', { name: /shop preferences/i }));

	expect(await screen.findByRole('heading', { name: 'Shop Preferences' })).toBeInTheDocument();
});

it('moves to and selects the next tab with the ArrowRight key', async () => {
	const user = userEvent.setup();
	renderSettings();
	await screen.findByRole('heading', { name: 'Account Details' });
	screen.getByRole('tab', { name: /account details/i }).focus();

	await user.keyboard('{ArrowRight}');

	const shopPreferencesTab = screen.getByRole('tab', { name: /shop preferences/i });
	expect(shopPreferencesTab).toHaveFocus();
	expect(shopPreferencesTab).toHaveAttribute('aria-selected', 'true');
	expect(await screen.findByRole('heading', { name: 'Shop Preferences' })).toBeInTheDocument();
});

it('wraps around to the previous tab with the ArrowLeft key', async () => {
	const user = userEvent.setup();
	renderSettings();
	await screen.findByRole('heading', { name: 'Account Details' });
	screen.getByRole('tab', { name: /account details/i }).focus();

	await user.keyboard('{ArrowLeft}');

	const shopPreferencesTab = screen.getByRole('tab', { name: /shop preferences/i });
	expect(shopPreferencesTab).toHaveFocus();
	expect(shopPreferencesTab).toHaveAttribute('aria-selected', 'true');
	expect(await screen.findByRole('heading', { name: 'Shop Preferences' })).toBeInTheDocument();
});

it('deselects and removes the inactive tab from the tab order when switching tabs', async () => {
	const user = userEvent.setup();
	renderSettings();
	await screen.findByRole('heading', { name: 'Account Details' });

	await user.click(screen.getByRole('tab', { name: /shop preferences/i }));

	const accountDetailsTab = screen.getByRole('tab', { name: /account details/i });
	expect(accountDetailsTab).toHaveAttribute('aria-selected', 'false');
	expect(accountDetailsTab).toHaveAttribute('tabIndex', '-1');
});
