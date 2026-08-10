import { parseFiltersFromURL, buildURLFromFilters } from './urlFilterUtils';

describe('parseFiltersFromURL', () => {
	it('parses a comma-separated colors param into a boolean map', () => {
		const params = new URLSearchParams('colors=red,black');
		expect(parseFiltersFromURL(params).colors).toEqual({ red: true, black: true });
	});

	it('parses a comma-separated brands param into a boolean map', () => {
		const params = new URLSearchParams('brands=Nike,Adidas');
		expect(parseFiltersFromURL(params).brands).toEqual({ Nike: true, Adidas: true });
	});

	it('parses release years as numeric keys', () => {
		const params = new URLSearchParams('releaseYears=2020,2021');
		expect(parseFiltersFromURL(params).releaseYears).toEqual({ 2020: true, 2021: true });
	});

	it('omits a filter type entirely when its param is absent', () => {
		const params = new URLSearchParams('colors=red');
		expect(parseFiltersFromURL(params).brands).toBeUndefined();
	});

	it('parses priceRanges into the nested {checked} shape, not a flat boolean', () => {
		const params = new URLSearchParams('priceRanges=' + encodeURIComponent('$0 - $25'));
		expect(parseFiltersFromURL(params).priceRanges).toEqual({ '$0 - $25': { checked: true } });
	});

	it('parses a comma-separated shoeSizes param into a boolean map', () => {
		const params = new URLSearchParams('shoeSizes=' + encodeURIComponent('M 9 / W 10.5'));
		expect(parseFiltersFromURL(params).shoeSizes).toEqual({ 'M 9 / W 10.5': true });
	});
});

describe('buildURLFromFilters', () => {
	it('includes only the colors that are set to true', () => {
		const query = buildURLFromFilters({ colors: { red: true, black: false } });
		expect(query).toBe('colors=red');
	});

	it('omits a filter type entirely when nothing in it is active', () => {
		const query = buildURLFromFilters({ colors: { red: false }, brands: { Nike: true } });
		expect(query).toBe('brands=Nike');
	});

	it('includes only price ranges that are checked', () => {
		const query = buildURLFromFilters({
			priceRanges: {
				'$0 - $25': { checked: true, priceRanges: { low: 0, high: 25 } },
				'$25 - $50': { checked: false, priceRanges: { low: 25, high: 50 } },
			},
		});
		expect(query).toBe(new URLSearchParams({ priceRanges: '$0 - $25' }).toString());
	});
});
