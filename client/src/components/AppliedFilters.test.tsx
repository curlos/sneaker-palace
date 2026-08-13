import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils';
import { makeEmptyFilters } from '../test-fixtures';
import getInitialFilters from '../utils/getInitialFilters';
import { AppliedFilters } from './AppliedFilters';

it('renders nothing when no filters are active', () => {
	const filters = getInitialFilters({});
	const { container } = render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(container).toBeEmptyDOMElement();
});

it('shows a chip naming the active filter', () => {
	const filters = makeEmptyFilters({ colors: { red: true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('Red', { exact: false })).toBeInTheDocument();
});

it('clears the filter category when its chip is dismissed', async () => {
	const filters = makeEmptyFilters({ colors: { red: true } });
	const updateFilters = vi.fn();
	const user = userEvent.setup();
	render(<AppliedFilters filters={filters} updateFilters={updateFilters} />);

	await user.click(screen.getByRole('button', { name: /clear color filter/i }));

	expect(updateFilters).toHaveBeenCalledWith(expect.objectContaining({ colors: { red: false } }));
});

it('renders nothing when a category has only a false value', () => {
	const filters = makeEmptyFilters({ colors: { red: false } });
	const { container } = render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(container).toBeEmptyDOMElement();
});

it('shows a plural label and joins values when multiple are selected', () => {
	const filters = makeEmptyFilters({ colors: { red: true, blue: true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('Colors', { exact: false })).toBeInTheDocument();
	expect(screen.getByText('Red, Blue', { exact: false })).toBeInTheDocument();
});

it('shows brand values without capitalization', () => {
	const filters = makeEmptyFilters({ brands: { nike: true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('nike', { exact: false })).toBeInTheDocument();
});

it('shows gender values capitalized', () => {
	const filters = makeEmptyFilters({ genders: { men: true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('Men', { exact: false })).toBeInTheDocument();
});

it('only shows price ranges that are checked', () => {
	const filters = makeEmptyFilters({
		priceRanges: {
			'0-50': { priceRanges: { low: 0, high: 50 }, checked: true },
			'50-100': { priceRanges: { low: 50, high: 100 }, checked: false },
		},
	});
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('0-50', { exact: false })).toBeInTheDocument();
	expect(screen.queryByText('50-100', { exact: false })).not.toBeInTheDocument();
});

it('shows release year values', () => {
	const filters = makeEmptyFilters({ releaseYears: { '2020': true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('2020', { exact: false })).toBeInTheDocument();
});

it('shows shoe size values', () => {
	const filters = makeEmptyFilters({ shoeSizes: { 'M 4.5 / W 6': true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByText('M 4.5 / W 6', { exact: false })).toBeInTheDocument();
});

it('renders a chip per active category when multiple categories are selected', () => {
	const filters = makeEmptyFilters({ colors: { red: true }, brands: { nike: true } });
	render(<AppliedFilters filters={filters} updateFilters={vi.fn()} />);

	expect(screen.getByRole('button', { name: /clear color filter/i })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: /clear brand filter/i })).toBeInTheDocument();
});

it('clears every selected value in a multi-value category', async () => {
	const filters = makeEmptyFilters({ colors: { red: true, blue: true } });
	const updateFilters = vi.fn();
	const user = userEvent.setup();
	render(<AppliedFilters filters={filters} updateFilters={updateFilters} />);

	await user.click(screen.getByRole('button', { name: /clear colors filter/i }));

	expect(updateFilters).toHaveBeenCalledWith(expect.objectContaining({ colors: { red: false, blue: false } }));
});

it('leaves other categories untouched when clearing one category', async () => {
	const filters = makeEmptyFilters({ colors: { red: true }, brands: { nike: true } });
	const updateFilters = vi.fn();
	const user = userEvent.setup();
	render(<AppliedFilters filters={filters} updateFilters={updateFilters} />);

	await user.click(screen.getByRole('button', { name: /clear color filter/i }));

	expect(updateFilters).toHaveBeenCalledWith(expect.objectContaining({ brands: { nike: true } }));
});

it('clears price ranges by unchecking while preserving the range bounds', async () => {
	const filters = makeEmptyFilters({
		priceRanges: { '0-50': { priceRanges: { low: 0, high: 50 }, checked: true } },
	});
	const updateFilters = vi.fn();
	const user = userEvent.setup();
	render(<AppliedFilters filters={filters} updateFilters={updateFilters} />);

	await user.click(screen.getByRole('button', { name: /clear price range filter/i }));

	expect(updateFilters).toHaveBeenCalledWith(
		expect.objectContaining({
			priceRanges: { '0-50': { priceRanges: { low: 0, high: 50 }, checked: false } },
		})
	);
});
