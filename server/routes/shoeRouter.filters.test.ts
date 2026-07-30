import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Shoe from '../models/Shoe';
import { IShoe } from '../types/types';
import { startTestServer, stopTestServer } from '../test/testServer';

let mongod: MongoMemoryServer;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

function buildFilterableShoe(overrides: Partial<IShoe> & { shoeID: string }): IShoe {
	return {
		sku: `sku-${overrides.shoeID}`,
		brand: 'Nike',
		name: `Shoe ${overrides.shoeID}`,
		colorway: 'Black',
		gender: 'men',
		silhouette: 'Generic Silhouette',
		releaseYear: 2020,
		releaseDate: '2020-01-01',
		retailPrice: 100,
		estimatedMarketValue: 150,
		story: '',
		image: {
			'360': [],
			original: `https://example.com/${overrides.shoeID}/original.jpg`,
			small: `https://example.com/${overrides.shoeID}/small.jpg`,
			thumbnail: `https://example.com/${overrides.shoeID}/thumb.jpg`,
		},
		links: {},
		ratings: [],
		rating: 0,
		favorites: [],
		inStock: true,
		...overrides,
	} as IShoe;
}

// Hand-known "matrix" catalog: every shoe below is deliberately placed so filter/sort/search
// tests can assert an exact expected result set, rather than deriving one at test time.
// Dimensions covered: all 10 color-filter buckets (including compound colorways), all 4
// genders, overlapping releaseYears (to prove $in matches multiple docs), retailPrices on
// and around every price-bucket boundary (25/50/100/150), varied rating/favorites/ratings
// for the array-length sorts, and distinctive words for the fallback text-search tests.
const filterCatalog: IShoe[] = [
	buildFilterableShoe({
		shoeID: 'matrix-1',
		brand: 'Nike',
		colorway: 'Red',
		gender: 'men',
		releaseYear: 2019,
		releaseDate: '2019-03-01',
		retailPrice: 10,
		rating: 4.5,
		favorites: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
		ratings: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
		name: 'Air Zoom Vortex Red Comet',
		silhouette: 'Air Zoom Vortex',
		story: 'A vivid red colorway inspired by comets.',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-2',
		brand: 'Air Jordan',
		colorway: 'Black/Court Purple/White',
		gender: 'youth',
		releaseYear: 2021,
		releaseDate: '2021-12-29',
		retailPrice: 25,
		rating: 3,
		favorites: [new mongoose.Types.ObjectId()],
		name: "Air Jordan 13 Retro PS 'Court Purple'",
		silhouette: 'Air Jordan 13',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-3',
		brand: 'adidas',
		colorway: 'Ash Grey',
		gender: 'women',
		releaseYear: 2021,
		releaseDate: '2021-11-20',
		retailPrice: 40,
		rating: 2,
		ratings: [new mongoose.Types.ObjectId()],
		name: 'Yeezy 500 Ash Grey',
		silhouette: 'Yeezy 500',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-4',
		brand: 'Jordan',
		colorway: 'Black/White-Red',
		gender: 'men',
		releaseYear: 2021,
		releaseDate: '2021-12-23',
		retailPrice: 50,
		rating: 5,
		favorites: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
		ratings: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
		name: 'Jordan 4 Retro Red Thunder',
		silhouette: 'Air Jordan 4',
		story: 'A thunderous red colorway.',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-5',
		brand: 'New Balance',
		colorway: 'Blue',
		gender: 'youth',
		releaseYear: 2018,
		releaseDate: '2018-06-15',
		retailPrice: 75,
		rating: 3.5,
		name: '990v5 Ocean Blue',
		silhouette: '990v5',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-6',
		brand: 'Puma',
		colorway: 'White/Green',
		gender: 'infant',
		releaseYear: 2022,
		releaseDate: '2022-04-10',
		retailPrice: 100,
		rating: 1,
		name: 'Suede Classic Green Fields',
		silhouette: 'Suede Classic',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-7',
		brand: 'Vans',
		colorway: 'Black',
		gender: 'men',
		releaseYear: 2020,
		releaseDate: '2020-09-05',
		retailPrice: 125,
		rating: 4,
		name: 'Old Skool Midnight',
		silhouette: 'Old Skool',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-8',
		brand: 'Converse',
		colorway: 'Brown',
		gender: 'women',
		releaseYear: 2023,
		releaseDate: '2023-11-11',
		retailPrice: 150,
		rating: 2.5,
		name: 'Chuck 70 Cocoa',
		silhouette: 'Chuck 70',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-9',
		brand: 'Nike',
		colorway: 'Pink',
		gender: 'women',
		releaseYear: 2023,
		releaseDate: '2023-08-01',
		retailPrice: 200,
		rating: 4.8,
		name: 'Air Max Blossom Pink',
		silhouette: 'Air Max 90',
		story: 'A blossoming pink hue for spring.',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-10',
		brand: 'Air Jordan',
		colorway: 'Yellow/Black',
		gender: 'infant',
		releaseYear: 2021,
		releaseDate: '2021-01-15',
		retailPrice: 60,
		rating: 3,
		name: 'Air Jordan 1 Low Solar Flare',
		silhouette: 'Air Jordan 1',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-11',
		brand: 'adidas',
		colorway: 'Gray',
		gender: 'youth',
		releaseYear: 1985,
		releaseDate: '1985-05-20',
		retailPrice: 80,
		rating: 3.2,
		name: 'Superstar Classic Slate',
		silhouette: 'Superstar',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-12',
		brand: 'Jordan',
		colorway: 'Purple/White',
		gender: 'men',
		releaseYear: 2019,
		releaseDate: '2019-07-30',
		retailPrice: 90,
		rating: 4.1,
		name: 'Jordan 6 Retro Grape Frost',
		silhouette: 'Air Jordan 6',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-13',
		brand: 'Nike',
		colorway: 'Black',
		gender: 'men',
		releaseYear: 2021,
		releaseDate: '2021-06-01',
		retailPrice: 20,
		rating: 4.4,
		name: 'Air Force Nightfall',
		silhouette: 'Air Force 1',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-14',
		brand: 'New Balance',
		colorway: 'Red/White',
		gender: 'women',
		releaseYear: 2020,
		releaseDate: '2020-02-14',
		retailPrice: 150,
		rating: 3.9,
		name: '574 Crimson Wave',
		silhouette: '574',
	}),
	buildFilterableShoe({
		shoeID: 'matrix-15',
		brand: 'Vans',
		colorway: 'Green',
		gender: 'infant',
		releaseYear: 2022,
		releaseDate: '2022-10-31',
		retailPrice: 100,
		rating: 2.2,
		name: 'Sk8-Hi Forest Trail',
		silhouette: 'Sk8-Hi',
		story: 'Inspired by the forest trail.',
	}),
];

// Volume filler: uniform shoes purely to give pagination tests enough documents to cross
// multiple pages. Tagged with field values that fall outside every real filter option
// (brand/colorway/gender/releaseYear aren't schema-enum-constrained, so these are safe to
// use as values no real filter test will ever select), so filtered tests naturally exclude
// them and pagination tests can isolate them precisely via `brand: ['Filler Brand']`.
// NOTE: retailPrice is the one dimension that can't have a fully "safe" value, since the 5
// price buckets collectively span $0-Infinity. This filler price (500) only falls in the
// open-ended "$150+" bucket, so only a "$150+ bucket alone, no other filters" test needs to
// account for it explicitly.
const FILLER_COUNT = 40;
const volumeFillerShoes: IShoe[] = Array.from({ length: FILLER_COUNT }, (_, i) =>
	buildFilterableShoe({
		shoeID: `filler-${i}`,
		brand: 'Filler Brand',
		colorway: 'Filler Colorway',
		gender: 'filler',
		releaseYear: 1900,
		retailPrice: 500,
		name: `Filler Shoe ${i}`,
		silhouette: 'Filler Silhouette',
	})
);

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
	await Shoe.insertMany([...filterCatalog, ...volumeFillerShoes]);
});

afterAll(async () => {
	await stopTestServer(mongod);
});

// Empty-but-well-formed filters payload: getSelectedFilters (shoeRouter.ts:59-73) just does
// Object.keys(filters.colors) etc., so an empty object per category safely means "nothing
// selected" without needing to mirror the full client-side ShoeFilters shape.
const EMPTY_FILTERS = { colors: {}, brands: {}, genders: {}, priceRanges: {}, releaseYears: {} };

function postShoes(overrides: Record<string, unknown> = {}) {
	return request(app)
		.post('/shoes')
		.send({ pageNum: 1, limit: 100, filters: EMPTY_FILTERS, ...overrides });
}

function matrixShoeIDs(docs: { shoeID: string }[]): string[] {
	return docs.map((doc) => doc.shoeID).filter((shoeID) => shoeID.startsWith('matrix-'));
}

describe('POST /shoes - sorting', () => {
	// Known descending order of the matrix catalog's releaseDates (see filterCatalog above).
	// releaseDate/releaseYear aren't in the route's $project output, so order can only be
	// verified via this known shoeID sequence, not a returned field value. Derived from
	// filterCatalog's releaseDates rather than hardcoded, so it can't drift out of sync if
	// those dates ever change.
	const NEWEST_ARRIVALS_ORDER = [...filterCatalog]
		.sort((a, b) => b.releaseDate!.localeCompare(a.releaseDate!))
		.map((shoe) => shoe.shoeID);

	it('sorts by releaseDate descending for "Newest Arrivals"', async () => {
		const res = await postShoes({ sortType: 'Newest Arrivals' });

		expect(res.status).toBe(200);
		expect(matrixShoeIDs(res.body.docs)).toEqual(NEWEST_ARRIVALS_ORDER);
	});

	it('sorts by releaseDate ascending for "Classic Releases"', async () => {
		const res = await postShoes({ sortType: 'Classic Releases' });

		expect(res.status).toBe(200);
		expect(matrixShoeIDs(res.body.docs)).toEqual([...NEWEST_ARRIVALS_ORDER].reverse());
	});

	it('sorts by retailPrice descending for "Price: High to Low"', async () => {
		const res = await postShoes({ sortType: 'Price: High to Low' });

		expect(res.status).toBe(200);
		const prices = res.body.docs.map((doc: { retailPrice: number }) => doc.retailPrice);
		for (let i = 1; i < prices.length; i++) {
			expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
		}
	});

	it('sorts by retailPrice ascending for "Price: Low to High"', async () => {
		const res = await postShoes({ sortType: 'Price: Low to High' });

		expect(res.status).toBe(200);
		const prices = res.body.docs.map((doc: { retailPrice: number }) => doc.retailPrice);
		for (let i = 1; i < prices.length; i++) {
			expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
		}
	});

	it('sorts by rating descending for "Highest Rated"', async () => {
		const res = await postShoes({ sortType: 'Highest Rated' });

		expect(res.status).toBe(200);
		const ratings = res.body.docs.map((doc: { rating: number }) => doc.rating);
		for (let i = 1; i < ratings.length; i++) {
			expect(ratings[i]).toBeLessThanOrEqual(ratings[i - 1]);
		}
	});

	it('sorts by favorites count descending for "Most Popular"', async () => {
		const res = await postShoes({ sortType: 'Most Popular' });

		expect(res.status).toBe(200);
		const favoritesCounts = res.body.docs.map((doc: { favorites: unknown[] }) => doc.favorites.length);
		for (let i = 1; i < favoritesCounts.length; i++) {
			expect(favoritesCounts[i]).toBeLessThanOrEqual(favoritesCounts[i - 1]);
		}

		// Monotonicity alone would still pass even if favoritesCount silently computed to 0 for
		// everything, since ~51 of the 55 seeded shoes tie at 0 favorites. Pin down the exact
		// top order among the 3 matrix shoes with distinct, non-zero counts (3/2/1) to make sure
		// the count is actually being computed and sorted on, not just coincidentally monotonic.
		expect(matrixShoeIDs(res.body.docs).slice(0, 3)).toEqual(['matrix-1', 'matrix-4', 'matrix-2']);
	});

	it('sorts by ratings count descending for "Most Reviewed"', async () => {
		const res = await postShoes({ sortType: 'Most Reviewed' });

		expect(res.status).toBe(200);
		const ratingsCounts = res.body.docs.map((doc: { ratings: unknown[] }) => doc.ratings.length);
		for (let i = 1; i < ratingsCounts.length; i++) {
			expect(ratingsCounts[i]).toBeLessThanOrEqual(ratingsCounts[i - 1]);
		}

		// Same reasoning as "Most Popular" above: pin the exact top order among the 3 matrix
		// shoes with distinct, non-zero ratings counts (3/2/1).
		expect(matrixShoeIDs(res.body.docs).slice(0, 3)).toEqual(['matrix-4', 'matrix-1', 'matrix-3']);
	});

	it('treats "Most Relevant" the same as the default ordering when there is no search query', async () => {
		// getSortType() (shoeRouter.ts:26-41) has no case for 'Most Relevant' at all, so without
		// a query it silently falls through to the same default as an unrecognized sortType
		// (releaseDate desc). The "skip regular sort" behavior only applies when a query is also
		// present, which is covered later in the search tests instead.
		const [mostRelevantRes, explicitRes] = await Promise.all([
			postShoes({ sortType: 'Most Relevant' }),
			postShoes({ sortType: 'Newest Arrivals' }),
		]);

		expect(mostRelevantRes.status).toBe(200);
		expect(matrixShoeIDs(mostRelevantRes.body.docs)).toEqual(matrixShoeIDs(explicitRes.body.docs));
	});

	it('defaults to "Newest Arrivals" ordering when sortType is missing or unrecognized', async () => {
		const [missingRes, unrecognizedRes, explicitRes] = await Promise.all([
			postShoes({}),
			postShoes({ sortType: 'Bogus Sort' }),
			postShoes({ sortType: 'Newest Arrivals' }),
		]);

		expect(missingRes.status).toBe(200);
		expect(unrecognizedRes.status).toBe(200);
		expect(matrixShoeIDs(missingRes.body.docs)).toEqual(matrixShoeIDs(explicitRes.body.docs));
		expect(matrixShoeIDs(unrecognizedRes.body.docs)).toEqual(matrixShoeIDs(explicitRes.body.docs));
	});
});

describe('POST /shoes - filtering', () => {
	it.todo('TODO');
});

describe('POST /shoes - search', () => {
	it.todo('TODO');
});

describe('POST /shoes - pagination', () => {
	it.todo('TODO');
});

describe('POST /shoes - error handling', () => {
	it.todo('TODO');
});
