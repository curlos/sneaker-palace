import getInitialFilters from './getInitialFilters';

describe('getInitialFilters', () => {
	it('defaults every filter to unchecked when given no state or URL params', () => {
		const filters = getInitialFilters({});
		expect(Object.values(filters.colors).every((v) => v === false)).toBe(true);
	});

	it('pre-selects the gender passed in via routerrtate', () => {
		const filters = getInitialFilters({ gender: 'men' });
		expect(filters.genders.men).toBe(true);
	});

	it('pre-selects a brand passed in via router state, normalizing its casing', () => {
		const filters = getInitialFilters({ brands: ['nike'] });
		expect(filters.brands.Nike).toBe(true);
	});

	it('merges checked colors from URL search params', () => {
		const filters = getInitialFilters({}, new URLSearchParams('colors=red'));
		expect(filters.colors.red).toBe(true);
	});

	it('merges checked price ranges from URL search params', () => {
		const filters = getInitialFilters({}, new URLSearchParams('priceRanges=' + encodeURIComponent('$0 - $25')));
		expect(filters.priceRanges['$0 - $25'].checked).toBe(true);
	});

	it('ignores a brand name that has no known mapping instead of crashing', () => {
		expect(() => getInitialFilters({ brands: ['not-a-real-brand'] })).not.toThrow();
		const filters = getInitialFilters({ brands: ['not-a-real-brand'] });
		expect(Object.values(filters.brands).every((v) => v === false)).toBe(true);
	});

	it('combines a router-state gender with URL-param colors without one clobbering the other', () => {
		const filters = getInitialFilters({ gender: 'men' }, new URLSearchParams('colors=red'));
		expect(filters.genders.men).toBe(true);
		expect(filters.colors.red).toBe(true);
	});
});
