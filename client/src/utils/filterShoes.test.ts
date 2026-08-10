import { makeShoe, makeEmptyFilters } from '../test-fixtures';
import { filterByColor, filterByBrand, filterByGender, filterByPrice, titleCase } from './filterShoes';

describe('filterByColor', () => {
	it('returns all shoes when no color is selected', () => {
		const shoes = [makeShoe({ colorway: 'Red/White' }), makeShoe({ colorway: 'Black/Black' })];
		expect(filterByColor(makeEmptyFilters({ colors: { red: false } }), shoes)).toHaveLength(2);
	});

	it('returns only shoes whose colorway matches the selected color', () => {
		const red = makeShoe({ shoeID: 'red', colorway: 'Red/White' });
		const black = makeShoe({ shoeID: 'black', colorway: 'Black/Black' });
		const result = filterByColor(makeEmptyFilters({ colors: { red: true, black: false } }), [red, black]);
		expect(result.map((s) => s.shoeID)).toEqual(['red']);
	});

	it('excludes a shoe whose colorway does not match the selected color', () => {
		const black = makeShoe({ shoeID: 'black', colorway: 'Black/Black' });
		const result = filterByColor(makeEmptyFilters({ colors: { red: true } }), [black]);
		expect(result).toHaveLength(0);
	});

	it('includes a shoe that matches either of two simultaneously selected colors', () => {
		const red = makeShoe({ shoeID: 'red', colorway: 'Red/White' });
		const black = makeShoe({ shoeID: 'black', colorway: 'Black/Black' });
		const white = makeShoe({ shoeID: 'white', colorway: 'White/White' });
		const result = filterByColor(makeEmptyFilters({ colors: { red: true, black: true } }), [red, black, white]);
		expect(result.map((s) => s.shoeID)).toEqual(['red', 'black']);
	});
});

describe('filterByBrand', () => {
	it('returns all shoes when no brand is selected', () => {
		const shoes = [makeShoe({ brand: 'Nike' }), makeShoe({ brand: 'Adidas' })];
		expect(filterByBrand(makeEmptyFilters({ brands: { NIKE: false } }), shoes)).toHaveLength(2);
	});

	it('returns only shoes matching the selected brand', () => {
		const nike = makeShoe({ shoeID: 'nike', brand: 'Nike' });
		const adidas = makeShoe({ shoeID: 'adidas', brand: 'Adidas' });
		const result = filterByBrand(makeEmptyFilters({ brands: { NIKE: true, ADIDAS: false } }), [nike, adidas]);
		expect(result.map((s) => s.shoeID)).toEqual(['nike']);
	});

	it('excludes a shoe whose brand does not match the selected brand', () => {
		const adidas = makeShoe({ shoeID: 'adidas', brand: 'Adidas' });
		const result = filterByBrand(makeEmptyFilters({ brands: { NIKE: true } }), [adidas]);
		expect(result).toHaveLength(0);
	});

	it('includes a shoe that matches either of two simultaneously selected brands', () => {
		const nike = makeShoe({ shoeID: 'nike', brand: 'Nike' });
		const adidas = makeShoe({ shoeID: 'adidas', brand: 'Adidas' });
		const puma = makeShoe({ shoeID: 'puma', brand: 'Puma' });
		const result = filterByBrand(makeEmptyFilters({ brands: { NIKE: true, ADIDAS: true } }), [nike, adidas, puma]);
		expect(result.map((s) => s.shoeID)).toEqual(['nike', 'adidas']);
	});
});

describe('filterByGender', () => {
	it('returns all shoes when no gender is selected', () => {
		const shoes = [makeShoe({ gender: 'men' }), makeShoe({ gender: 'women' })];
		expect(filterByGender(makeEmptyFilters({ genders: { Men: false } }), shoes)).toHaveLength(2);
	});

	it('returns only shoes matching the selected gender', () => {
		const men = makeShoe({ shoeID: 'men', gender: 'men' });
		const women = makeShoe({ shoeID: 'women', gender: 'women' });
		const result = filterByGender(makeEmptyFilters({ genders: { Men: true, Women: false } }), [men, women]);
		expect(result.map((s) => s.shoeID)).toEqual(['men']);
	});

	it('excludes a shoe whose gender does not match the selected gender', () => {
		const women = makeShoe({ shoeID: 'women', gender: 'women' });
		const result = filterByGender(makeEmptyFilters({ genders: { Men: true } }), [women]);
		expect(result).toHaveLength(0);
	});

	it('includes a shoe that matches either of two simultaneously selected genders', () => {
		const men = makeShoe({ shoeID: 'men', gender: 'men' });
		const women = makeShoe({ shoeID: 'women', gender: 'women' });
		const kids = makeShoe({ shoeID: 'kids', gender: 'kids' });
		const result = filterByGender(makeEmptyFilters({ genders: { Men: true, Women: true } }), [men, women, kids]);
		expect(result.map((s) => s.shoeID)).toEqual(['men', 'women']);
	});
});

describe('filterByPrice', () => {
	const priceRange = (low: number, high: number | null, checked: boolean) => ({
		checked,
		priceRanges: { low, high },
	});

	it('returns all shoes when no price range is checked', () => {
		const shoes = [makeShoe({ retailPrice: 50 }), makeShoe({ retailPrice: 500 })];
		expect(
			filterByPrice(makeEmptyFilters({ priceRanges: { boundedRange: priceRange(0, 100, false) } }), shoes)
		).toHaveLength(2);
	});

	it('includes shoes within a bounded checked price range', () => {
		const cheap = makeShoe({ shoeID: 'cheap', retailPrice: 50 });
		const expensive = makeShoe({ shoeID: 'expensive', retailPrice: 500 });
		const result = filterByPrice(makeEmptyFilters({ priceRanges: { boundedRange: priceRange(0, 100, true) } }), [
			cheap,
			expensive,
		]);
		expect(result.map((s) => s.shoeID)).toEqual(['cheap']);
	});

	it('includes shoes at or above the low bound when the range has no upper bound', () => {
		const cheap = makeShoe({ shoeID: 'cheap', retailPrice: 50 });
		const expensive = makeShoe({ shoeID: 'expensive', retailPrice: 500 });
		const result = filterByPrice(makeEmptyFilters({ priceRanges: { openRange: priceRange(150, null, true) } }), [
			cheap,
			expensive,
		]);
		expect(result.map((s) => s.shoeID)).toEqual(['expensive']);
	});

	it('includes a shoe priced exactly at the low boundary of a checked range', () => {
		const atLowBound = makeShoe({ shoeID: 'at-low', retailPrice: 0 });
		const result = filterByPrice(makeEmptyFilters({ priceRanges: { boundedRange: priceRange(0, 100, true) } }), [
			atLowBound,
		]);
		expect(result.map((s) => s.shoeID)).toEqual(['at-low']);
	});

	it('includes a shoe priced exactly at the high boundary of a checked range', () => {
		const atHighBound = makeShoe({ shoeID: 'at-high', retailPrice: 100 });
		const result = filterByPrice(makeEmptyFilters({ priceRanges: { boundedRange: priceRange(0, 100, true) } }), [
			atHighBound,
		]);
		expect(result.map((s) => s.shoeID)).toEqual(['at-high']);
	});

	it('excludes a shoe priced just above the high boundary of a checked range', () => {
		const justOver = makeShoe({ shoeID: 'just-over', retailPrice: 101 });
		const result = filterByPrice(makeEmptyFilters({ priceRanges: { boundedRange: priceRange(0, 100, true) } }), [
			justOver,
		]);
		expect(result).toHaveLength(0);
	});

	it('includes a shoe that matches either of two simultaneously checked ranges', () => {
		const midRange = makeShoe({ shoeID: 'mid', retailPrice: 75 });
		const highRange = makeShoe({ shoeID: 'high', retailPrice: 175 });
		const result = filterByPrice(
			makeEmptyFilters({
				priceRanges: { boundedRange: priceRange(0, 100, true), openRange: priceRange(150, null, true) },
			}),
			[midRange, highRange]
		);
		expect(result.map((s) => s.shoeID)).toEqual(['mid', 'high']);
	});
});

describe('titleCase', () => {
	it('capitalizes the first letter of every word', () => {
		expect(titleCase('nike air max')).toBe('Nike Air Max');
	});
});
