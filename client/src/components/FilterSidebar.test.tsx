import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../test-utils';
import getInitialFilters from '../utils/getInitialFilters';
import { SHOE_SIZES } from '../utils/shoeConstants';
import { ShoeFilters } from '../types/types';
import Sidebar from './FilterSidebar';

const renderSidebar = (filterOverrides: Partial<ShoeFilters> = {}, shoeSizes: Array<string> = SHOE_SIZES) => {
	const filters = { ...getInitialFilters({}), ...filterOverrides };
	const updateFilters = vi.fn();
	const user = userEvent.setup();
	render(<Sidebar filters={filters} updateFilters={updateFilters} shoeSizes={shoeSizes} />);
	return { updateFilters, user };
};

it('collapses a filter panel by default', () => {
	renderSidebar();

	expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument();
});

it('expands a panel when its header is clicked', async () => {
	const { user } = renderSidebar();

	await user.click(screen.getByRole('button', { name: 'Brand' }));

	expect(screen.getByRole('group', { name: 'Brand' })).toBeInTheDocument();
});

it('collapses an expanded panel when its header is clicked again', async () => {
	const { user } = renderSidebar();

	await user.click(screen.getByRole('button', { name: 'Brand' }));
	await user.click(screen.getByRole('button', { name: 'Brand' }));

	expect(screen.queryByRole('group', { name: 'Brand' })).not.toBeInTheDocument();
});

it('keeps a section expanded when a different section is expanded', async () => {
	const { user } = renderSidebar();

	await user.click(screen.getByRole('button', { name: 'Brand' }));
	await user.click(screen.getByRole('button', { name: 'Gender' }));

	expect(screen.getByRole('group', { name: 'Brand' })).toBeInTheDocument();
});

it('toggles a color on when its swatch is clicked', async () => {
	const { updateFilters, user } = renderSidebar();

	await user.click(screen.getByRole('button', { name: 'Color' }));
	await user.click(screen.getByRole('button', { name: 'red' }));

	expect(updateFilters).toHaveBeenCalledWith(
		expect.objectContaining({ colors: expect.objectContaining({ red: true }) })
	);
});

it('toggles a color off when it is already active', async () => {
	const { updateFilters, user } = renderSidebar({ colors: { ...getInitialFilters({}).colors, red: true } });

	await user.click(screen.getByRole('button', { name: 'Color' }));
	await user.click(screen.getByRole('button', { name: 'red' }));

	expect(updateFilters).toHaveBeenCalledWith(
		expect.objectContaining({ colors: expect.objectContaining({ red: false }) })
	);
});

it('toggles a brand off when it is already checked', async () => {
	const { updateFilters, user } = renderSidebar({ brands: { ...getInitialFilters({}).brands, Nike: true } });

	await user.click(screen.getByRole('button', { name: 'Brand' }));
	await user.click(screen.getByRole('checkbox', { name: 'Nike' }));

	expect(updateFilters).toHaveBeenCalledWith(
		expect.objectContaining({ brands: expect.objectContaining({ Nike: false }) })
	);
});

it.each([
	{ section: 'Brand', optionName: 'Nike', expected: { brands: expect.objectContaining({ Nike: true }) } },
	{ section: 'Gender', optionName: 'men', expected: { genders: expect.objectContaining({ men: true }) } },
	{
		section: 'Price',
		optionName: '$0 - $25',
		expected: { priceRanges: expect.objectContaining({ '$0 - $25': expect.objectContaining({ checked: true }) }) },
	},
	{
		section: 'Release Year',
		optionName: '2025',
		expected: { releaseYears: expect.objectContaining({ 2025: true }) },
	},
])(
	'toggles $optionName on in the $section section when its checkbox is checked',
	async ({ section, optionName, expected }) => {
		const { updateFilters, user } = renderSidebar();

		await user.click(screen.getByRole('button', { name: section }));
		await user.click(screen.getByRole('checkbox', { name: optionName }));

		expect(updateFilters).toHaveBeenCalledWith(expect.objectContaining(expected));
	}
);

it('renders release years in descending order', async () => {
	const { user } = renderSidebar();

	await user.click(screen.getByRole('button', { name: 'Release Year' }));
	const panel = screen.getByRole('group', { name: 'Release Year' });
	const years = within(panel)
		.getAllByRole('checkbox')
		.map((checkbox) => Number(checkbox.closest('label')?.textContent));

	for (let i = 1; i < years.length; i++) {
		expect(years[i]).toBeLessThan(years[i - 1]);
	}
});

it('calls updateFilters with the size toggled on when a size button is clicked', async () => {
	const { updateFilters, user } = renderSidebar({}, ['M 9 / W 10.5']);

	await user.click(screen.getByRole('button', { name: 'Size' }));
	await user.click(screen.getByRole('button', { name: 'M 9 / W 10.5' }));

	expect(updateFilters).toHaveBeenCalledWith(
		expect.objectContaining({ shoeSizes: expect.objectContaining({ 'M 9 / W 10.5': true }) })
	);
});
