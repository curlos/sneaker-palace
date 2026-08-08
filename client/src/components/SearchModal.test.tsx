import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import SearchModal from './SearchModal';

it('pre-fills the search input from the URL query param on the /shoes page', () => {
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={vi.fn()} />, {
		route: '/shoes?query=jordan',
	});

	expect(screen.getByPlaceholderText('TYPE TO SEARCH')).toHaveValue('jordan');
});

it('starts with an empty search input on other pages', () => {
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={vi.fn()} />, { route: '/' });

	expect(screen.getByPlaceholderText('TYPE TO SEARCH')).toHaveValue('');
});

it('does not show the View Full Results button before any text is typed', () => {
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={vi.fn()} />);

	expect(screen.queryByRole('button', { name: /view full results/i })).not.toBeInTheDocument();
});

it('shows the View Full Results button after the debounce delay once text is typed', async () => {
	const user = userEvent.setup();
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={vi.fn()} />);

	await user.type(screen.getByPlaceholderText('TYPE TO SEARCH'), 'air max');

	await waitFor(
		() => expect(screen.getByRole('button', { name: /view full results/i })).toBeInTheDocument(),
		{ timeout: 2000 }
	);
});

it('navigates to the search results and closes the modal on submit', async () => {
	const setShowSearchModal = vi.fn();
	const user = userEvent.setup();
	const { history } = renderWithProviders(
		<SearchModal showSearchModal={true} setShowSearchModal={setShowSearchModal} />
	);

	await user.type(screen.getByPlaceholderText('TYPE TO SEARCH'), 'air max{Enter}');

	expect(history.location.pathname + history.location.search).toBe('/shoes?query=air%20max');
	expect(setShowSearchModal).toHaveBeenCalledWith(false);
});

it('navigates to the search results and closes the modal when View Full Results is clicked', async () => {
	const setShowSearchModal = vi.fn();
	const user = userEvent.setup();
	const { history } = renderWithProviders(
		<SearchModal showSearchModal={true} setShowSearchModal={setShowSearchModal} />
	);
	await user.type(screen.getByPlaceholderText('TYPE TO SEARCH'), 'air max');
	const viewResultsButton = await waitFor(
		() => screen.getByRole('button', { name: /view full results/i }),
		{ timeout: 2000 }
	);

	await user.click(viewResultsButton);

	expect(history.location.pathname + history.location.search).toBe('/shoes?query=air%20max');
	expect(setShowSearchModal).toHaveBeenCalledWith(false);
});

it('closes the modal when the backdrop is clicked', async () => {
	const setShowSearchModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={setShowSearchModal} />);
	const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;

	await user.click(backdrop);

	expect(setShowSearchModal).toHaveBeenCalledWith(false);
});

it('does not close the modal when clicking inside the dialog', async () => {
	const setShowSearchModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={setShowSearchModal} />);

	await user.click(screen.getByRole('dialog'));

	expect(setShowSearchModal).not.toHaveBeenCalled();
});

it('closes the modal when Escape is pressed', async () => {
	const setShowSearchModal = vi.fn();
	const user = userEvent.setup();
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={setShowSearchModal} />);

	await user.keyboard('{Escape}');

	expect(setShowSearchModal).toHaveBeenCalledWith(false);
});

it.only('renders product results inside the modal', async () => {
	renderWithProviders(<SearchModal showSearchModal={true} setShowSearchModal={vi.fn()} />);

	expect(await screen.findByText('Air Max 1')).toBeInTheDocument();
});
