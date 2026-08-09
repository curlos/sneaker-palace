import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import { SortDropdown } from './SortDropdown';

const sortOptions = [
	'Newest Arrivals',
	'Most Popular',
	'Highest Rated',
	'Most Reviewed',
	'Most Relevant',
	'Price: Low to High',
	'Price: High to Low',
	'Classic Releases',
];

it('renders the current sort type on the toggle button', () => {
	render(<SortDropdown sortType="Newest Arrivals" setSortType={vi.fn()} />);

	expect(screen.getByRole('button', { name: /sort by:\s*newest arrivals/i })).toBeInTheDocument();
});

it('does not show the sort options before the button is clicked', () => {
	render(<SortDropdown sortType="Newest Arrivals" setSortType={vi.fn()} />);

	expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
});

it('shows all sort options when the button is clicked', async () => {
	const user = userEvent.setup();
	render(<SortDropdown sortType="Newest Arrivals" setSortType={vi.fn()} />);

	await user.click(screen.getByRole('button', { name: /sort by/i }));

	expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(sortOptions);
});

it.each(sortOptions)('calls setSortType with "%s" when that option is clicked', async (sortValue) => {
	const setSortType = vi.fn();
	const user = userEvent.setup();
	render(<SortDropdown sortType="Newest Arrivals" setSortType={setSortType} />);

	await user.click(screen.getByRole('button', { name: /sort by/i }));
	await user.click(screen.getByRole('menuitem', { name: sortValue }));

	expect(setSortType).toHaveBeenCalledWith(sortValue);
});

it('closes the menu after an option is selected', async () => {
	const user = userEvent.setup();
	render(<SortDropdown sortType="Newest Arrivals" setSortType={vi.fn()} />);

	await user.click(screen.getByRole('button', { name: /sort by/i }));
	await user.click(screen.getByRole('menuitem', { name: 'Highest Rated' }));

	expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
});
