import { describe, it, expect } from 'vitest';
import { Shoe } from '../types/types';
import { sortByLowestPrice, sortByHighestPrice } from './sortShoes';

const makeShoe = (overrides: Partial<Shoe>): Shoe => ({
	_id: undefined,
	shoeID: '1',
	sku: 'sku',
	brand: 'brand',
	name: 'name',
	colorway: 'colorway',
	gender: 'gender',
	silhouette: 'silhouette',
	releaseYear: 2020,
	releaseDate: '2020-01-01',
	retailPrice: 100,
	estimatedMarketValue: 100,
	story: '',
	image: { '360': [], original: '', small: '', thumbnail: '' },
	links: { stockX: '', goat: '', flightClub: '', stadiumGoods: '' },
	ratings: [],
	rating: 0,
	favorites: [],
	createdAt: '',
	updatedAt: '',
	...overrides,
});

describe('sortShoes', () => {
	const shoes = [makeShoe({ shoeID: 'a', retailPrice: 200 }), makeShoe({ shoeID: 'b', retailPrice: 100 })];

	it('sortByLowestPrice orders cheapest first', () => {
		const sorted = sortByLowestPrice(shoes);
		expect(sorted.map((shoe) => shoe.shoeID)).toEqual(['b', 'a']);
	});

	it('sortByHighestPrice orders most expensive first', () => {
		const sorted = sortByHighestPrice(shoes);
		expect(sorted.map((shoe) => shoe.shoeID)).toEqual(['a', 'b']);
	});
});
