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
	// Mongoose builds indexes asynchronously in the background after connecting; Shoe.init()
	// resolves once this model's indexes (including the text index the search tests need) are
	// actually built, so $text queries don't race against index creation.
	await Shoe.init();
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
	// Asserts both the exact set of matched matrix shoes AND that no other doc (including
	// filler) leaked into the result — length alone wouldn't catch wrong-shoes-right-count,
	// and matrixShoeIDs alone wouldn't catch extra filler leaking in (e.g. via a price bucket
	// that filler's retailPrice also happens to fall into).
	function expectMatches(res: { status: number; body: { docs: { shoeID: string }[] } }, expectedIDs: string[]) {
		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(expectedIDs.length);
		expect(matrixShoeIDs(res.body.docs).sort()).toEqual([...expectedIDs].sort());
	}

	function priceRangeFilters(...ranges: { low: number; high: number | null }[]) {
		const priceRanges: Record<string, { checked: boolean; priceRanges: { low: number; high: number | null } }> = {};
		ranges.forEach((range, i) => {
			priceRanges[`range-${i}`] = { checked: true, priceRanges: range };
		});
		return priceRanges;
	}

	it('filters by a single color', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, colors: { Red: true } } });

		expectMatches(res, ['matrix-1', 'matrix-4', 'matrix-14']);
	});

	it('filters by multiple colors (OR)', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, colors: { Black: true, Blue: true } } });

		expectMatches(res, ['matrix-2', 'matrix-4', 'matrix-5', 'matrix-7', 'matrix-10', 'matrix-13']);
	});

	it('matches colors case-insensitively', async () => {
		// Same expected matches as "filters by a single color" above, but with a lowercase key.
		// Proves the route's $options: 'i' flag is actually doing something — every other color
		// test here uses matching casing, so none of them would catch this flag being removed.
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, colors: { red: true } } });

		expectMatches(res, ['matrix-1', 'matrix-4', 'matrix-14']);
	});

	it('filters by a single brand', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, brands: { Nike: true } } });

		expectMatches(res, ['matrix-1', 'matrix-9', 'matrix-13']);
	});

	it('filters by multiple brands', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, brands: { Nike: true, Vans: true } } });

		expectMatches(res, ['matrix-1', 'matrix-7', 'matrix-9', 'matrix-13', 'matrix-15']);
	});

	it('does not match brands case-insensitively (exact match only, unlike colors)', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, brands: { nike: true } } });

		expectMatches(res, []);
	});

	it('filters by a single gender', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, genders: { women: true } } });

		expectMatches(res, ['matrix-3', 'matrix-8', 'matrix-9', 'matrix-14']);
	});

	it('filters by multiple genders', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, genders: { infant: true, youth: true } } });

		expectMatches(res, ['matrix-2', 'matrix-5', 'matrix-6', 'matrix-10', 'matrix-11', 'matrix-15']);
	});

	it('filters by a single release year, matching multiple shoes', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, releaseYears: { '2021': true } } });

		expectMatches(res, ['matrix-2', 'matrix-3', 'matrix-4', 'matrix-10', 'matrix-13']);
	});

	it('filters by multiple release years', async () => {
		const res = await postShoes({
			filters: { ...EMPTY_FILTERS, releaseYears: { '2019': true, '2023': true } },
		});

		expectMatches(res, ['matrix-1', 'matrix-8', 'matrix-9', 'matrix-12']);
	});

	it('filters by a bounded price range, inclusive of both boundaries', async () => {
		const res = await postShoes({
			filters: { ...EMPTY_FILTERS, priceRanges: priceRangeFilters({ low: 25, high: 50 }) },
		});

		expectMatches(res, ['matrix-2', 'matrix-3', 'matrix-4']);
	});

	it('filters by an open-ended price range ("$150+"), correctly including the filler shoes too', async () => {
		const res = await postShoes({
			filters: { ...EMPTY_FILTERS, priceRanges: priceRangeFilters({ low: 150, high: null }) },
		});

		// volumeFillerShoes are all retailPrice: 500, which genuinely satisfies $gte: 150 — with
		// no other filter dimension applied, they're correctly included here. This is real,
		// intended behavior (an unbounded price filter matches everything above it), not a gap.
		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(3 + volumeFillerShoes.length);
		expect(matrixShoeIDs(res.body.docs).sort()).toEqual(['matrix-14', 'matrix-8', 'matrix-9'].sort());
	});

	it('combining an open-ended price range with another filter excludes the filler shoes', async () => {
		const res = await postShoes({
			filters: {
				...EMPTY_FILTERS,
				priceRanges: priceRangeFilters({ low: 150, high: null }),
				brands: { Nike: true, Converse: true, 'New Balance': true },
			},
		});

		expectMatches(res, ['matrix-8', 'matrix-9', 'matrix-14']);
	});

	it('filters by multiple price ranges (OR)', async () => {
		const res = await postShoes({
			filters: {
				...EMPTY_FILTERS,
				priceRanges: priceRangeFilters({ low: 0, high: 25 }, { low: 100, high: 150 }),
			},
		});

		expectMatches(res, [
			'matrix-1',
			'matrix-2',
			'matrix-13',
			'matrix-6',
			'matrix-7',
			'matrix-8',
			'matrix-14',
			'matrix-15',
		]);
	});

	it('returns every shoe when no filters are selected', async () => {
		const res = await postShoes({ filters: EMPTY_FILTERS });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(filterCatalog.length + volumeFillerShoes.length);
		expect(matrixShoeIDs(res.body.docs).sort()).toEqual(filterCatalog.map((shoe) => shoe.shoeID).sort());
	});

	it('ANDs filters across categories together', async () => {
		const res = await postShoes({
			filters: { ...EMPTY_FILTERS, brands: { Nike: true }, genders: { women: true } },
		});

		expectMatches(res, ['matrix-9']);
	});

	it('narrows correctly when every filter category is applied at once', async () => {
		// color=Black -> matrix-2,4,7,10,13
		// ∩ brand=Jordan|Nike -> matrix-4,13 (matrix-2,7,10 aren't Jordan/Nike; matrix-12 is
		// Jordan but has no black in its colorway, matrix-1/9 are Nike but red/pink)
		// ∩ gender=men -> still matrix-4,13 (both are men)
		// ∩ releaseYear=2021 -> still matrix-4,13 (both are 2021)
		// ∩ price 25-50 -> matrix-4 (50, boundary-inclusive) only; matrix-13 is 20, excluded
		const res = await postShoes({
			filters: {
				colors: { Black: true },
				brands: { Jordan: true, Nike: true },
				genders: { men: true },
				releaseYears: { '2021': true },
				priceRanges: priceRangeFilters({ low: 25, high: 50 }),
			},
		});

		expectMatches(res, ['matrix-4']);
	});

	it('returns an empty result when a valid filter matches no shoes', async () => {
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, brands: { Reebok: true } } });

		expectMatches(res, []);
	});

	it('returns a 500 error when a color filter key contains an invalid regex pattern', async () => {
		// selectedColors.join('|') interpolates raw filter keys directly into a MongoDB $regex
		// with no escaping. An unbalanced '(' is invalid regex syntax, so the aggregate() call
		// throws instead of filtering cleanly — no query is present, so there's no fallback path.
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, colors: { '(': true } } });

		expect(res.status).toBe(500);
	});
});

describe('POST /shoes - search', () => {
	// Real Atlas $search can't run against mongodb-memory-server (no mongot process), so any
	// non-empty query always throws inside the primary aggregate() call and falls into the
	// route's fallback $text-search path (shoeRouter.ts:313-347) — that's what every test below
	// actually exercises, not the real Atlas Search pipeline.

	it('matches a shoe via its name field', async () => {
		const res = await postShoes({ query: 'Thunder' });

		expect(res.status).toBe(200);
		expect(res.body.docs.map((doc: { shoeID: string }) => doc.shoeID)).toEqual(['matrix-4']);
	});

	it('trims the query before matching', async () => {
		const res = await postShoes({ query: '  Thunder  ' });

		expect(res.status).toBe(200);
		expect(res.body.docs.map((doc: { shoeID: string }) => doc.shoeID)).toEqual(['matrix-4']);
	});

	it('treats a whitespace-only query as no search at all', async () => {
		// req.body.query.trim() is falsy for a whitespace-only string, so the $search stage
		// should never even get added — this should behave identically to omitting query
		// entirely, not attempt a search for literal whitespace.
		const res = await postShoes({ query: '   ' });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(filterCatalog.length + volumeFillerShoes.length);
		expect(matrixShoeIDs(res.body.docs).sort()).toEqual(filterCatalog.map((shoe) => shoe.shoeID).sort());
	});

	it('matches a shoe via its story field, not just name', async () => {
		// "vivid" only appears in matrix-1's story ("A vivid red colorway inspired by comets.") —
		// deliberately not a word that also appears (or stems to a shared root) in name/silhouette,
		// so a match here proves the story field is actually indexed and searched.
		const res = await postShoes({ query: 'vivid' });

		expect(res.status).toBe(200);
		expect(res.body.docs.map((doc: { shoeID: string }) => doc.shoeID)).toEqual(['matrix-1']);
	});

	it('combines a search query with an active filter', async () => {
		// "Air" alone matches 7 matrix shoes across several brands; adding a Nike brand filter
		// narrows it to just the Nike ones, proving the fallback's ...buildFilterMatch() spread
		// actually applies on top of the $text search, not just the text match alone.
		const res = await postShoes({
			query: 'Air',
			filters: { ...EMPTY_FILTERS, brands: { Nike: true } },
		});

		expect(res.status).toBe(200);
		expect(res.body.docs.map((doc: { shoeID: string }) => doc.shoeID).sort()).toEqual(
			['matrix-1', 'matrix-9', 'matrix-13'].sort()
		);
	});

	it('returns an empty result for a query that matches nothing', async () => {
		const res = await postShoes({ query: 'xyznonexistentqueryterm' });

		expect(res.status).toBe(200);
		expect(res.body.docs).toEqual([]);
	});

	it('returns an empty result when a filter eliminates every search match', async () => {
		// "Air" matches matrix-1,2,4,9,10,12,13, whose brands are only Nike/Air Jordan/Jordan —
		// filtering to adidas (which owns none of those) should leave nothing, not error.
		const res = await postShoes({
			query: 'Air',
			filters: { ...EMPTY_FILTERS, brands: { adidas: true } },
		});

		expect(res.status).toBe(200);
		expect(res.body.docs).toEqual([]);
	});

	it('reports degraded pagination metadata regardless of the real match count', async () => {
		// "Air" matches 7 shoes total; with limit: 3, a correct implementation would report
		// totalPages: 3 and hasNextPage: true on page 1. The fallback path (shoeRouter.ts:332-343)
		// instead hardcodes totalPages: 1 and hasNextPage/hasPrevPage: false unconditionally, and
		// sets totalDocs to the current page's length rather than the true total match count. This
		// locks in that real, current behavior rather than assuming it's correct.
		const res = await postShoes({ query: 'Air', limit: 3, pageNum: 1 });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(3);
		expect(res.body.totalDocs).toBe(3);
		expect(res.body.totalPages).toBe(1);
		expect(res.body.hasNextPage).toBe(false);
		expect(res.body.hasPrevPage).toBe(false);
	});

	it('still paginates the actual returned docs correctly via skip/limit', async () => {
		// Despite the metadata quirk above, the underlying .skip()/.limit() on the real query
		// still works — page 1 and page 2 should return different, correctly-offset shoes.
		// Uses limit: 2 to stay within the top 4 ranked "Air" matches (matrix-10, matrix-2,
		// matrix-13, matrix-9), which have strictly distinct textScores — matrix-12 and matrix-4
		// tie for 6th/7th place, and Mongo doesn't guarantee stable ordering for tied sort keys,
		// so asserting into that tied range would be flaky.
		const [page1, page2] = await Promise.all([
			postShoes({ query: 'Air', limit: 2, pageNum: 1 }),
			postShoes({ query: 'Air', limit: 2, pageNum: 2 }),
		]);

		const page1IDs = page1.body.docs.map((doc: { shoeID: string }) => doc.shoeID);
		const page2IDs = page2.body.docs.map((doc: { shoeID: string }) => doc.shoeID);

		expect(page1IDs).toEqual(['matrix-10', 'matrix-2']);
		expect(page2IDs).toEqual(['matrix-13', 'matrix-9']);
	});

	it('ignores sortType once a search query is present', async () => {
		// getSortType()'s result is never applied in the fallback path — it always sorts by
		// textScore instead (shoeRouter.ts:327). Confirm two different sortTypes for the same
		// query return identical order, closing the loop on what the sorting block deferred here.
		// Compares only the top 5 of 7 "Air" matches — matrix-12/matrix-4 tie for 6th/7th place,
		// and comparing across two separate requests could flake if Mongo resolves that tie
		// differently between them (ordering for tied sort keys isn't guaranteed stable).
		const [mostRelevantRes, priceSortRes] = await Promise.all([
			postShoes({ query: 'Air', sortType: 'Most Relevant' }),
			postShoes({ query: 'Air', sortType: 'Price: High to Low' }),
		]);

		expect(mostRelevantRes.status).toBe(200);
		expect(mostRelevantRes.body.docs.slice(0, 5).map((doc: { shoeID: string }) => doc.shoeID)).toEqual(
			priceSortRes.body.docs.slice(0, 5).map((doc: { shoeID: string }) => doc.shoeID)
		);
	});

	it('returns full document fields in the fallback, unlike the restricted $project on the primary path', async () => {
		const res = await postShoes({ query: 'Thunder' });

		expect(res.status).toBe(200);
		expect(res.body.docs[0].releaseYear).toBe(2021);
		expect(res.body.docs[0].estimatedMarketValue).toBe(150);
	});
});

describe('POST /shoes - pagination', () => {
	// volumeFillerShoes are all tagged brand: 'Filler Brand' — filtering to just that brand
	// isolates exactly 40 uniform shoes, a large, precisely-known count to test skip/limit
	// boundary math against without reasoning about the heterogeneous 15-shoe matrix catalog.
	const FILLER_ONLY_FILTERS = { ...EMPTY_FILTERS, brands: { 'Filler Brand': true } };

	it('defaults to a limit of 12 when limit is omitted', async () => {
		// postShoes defaults limit: 100 itself, so pass undefined to truly omit it from the
		// request body (JSON.stringify drops undefined keys) and exercise the route's own default.
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, pageNum: 1, limit: undefined });

		expect(res.status).toBe(200);
		expect(res.body.limit).toBe(12);
		expect(res.body.docs.length).toBe(12);
		expect(res.body.totalDocs).toBe(volumeFillerShoes.length);
	});

	it('respects a custom limit and computes the correct skip', async () => {
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 5, pageNum: 3 });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(5);
		expect(res.body.totalDocs).toBe(40);
		expect(res.body.totalPages).toBe(8);
		expect(res.body.hasNextPage).toBe(true);
		expect(res.body.hasPrevPage).toBe(true);
		expect(res.body.nextPage).toBe(4);
		expect(res.body.prevPage).toBe(2);
		expect(res.body.pagingCounter).toBe(11);
	});

	it('reports first-page metadata correctly', async () => {
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 12, pageNum: 1 });

		expect(res.status).toBe(200);
		expect(res.body.hasPrevPage).toBe(false);
		expect(res.body.prevPage).toBeNull();
		expect(res.body.pagingCounter).toBe(1);
	});

	it('reports middle-page metadata correctly', async () => {
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 12, pageNum: 2 });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(12);
		expect(res.body.hasNextPage).toBe(true);
		expect(res.body.hasPrevPage).toBe(true);
		expect(res.body.nextPage).toBe(3);
		expect(res.body.prevPage).toBe(1);
		expect(res.body.pagingCounter).toBe(13);
	});

	it('reports last-page metadata correctly, including a partial page', async () => {
		// 40 filler shoes / limit 12 -> 4 pages, with only 4 shoes on the last page.
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 12, pageNum: 4 });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(4);
		expect(res.body.totalPages).toBe(4);
		expect(res.body.hasNextPage).toBe(false);
		expect(res.body.nextPage).toBeNull();
		expect(res.body.hasPrevPage).toBe(true);
		expect(res.body.prevPage).toBe(3);
	});

	it('returns an empty docs array (not an error) when requesting a page beyond the available data', async () => {
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 12, pageNum: 5 });

		expect(res.status).toBe(200);
		expect(res.body.docs).toEqual([]);
		expect(res.body.totalPages).toBe(4);
		expect(res.body.hasNextPage).toBe(false);
		expect(res.body.hasPrevPage).toBe(true);
		expect(res.body.prevPage).toBe(4);
	});

	it('computes totalDocs/totalPages from the filtered count, not the whole collection', async () => {
		// colors: { Black: true } matches exactly 5 matrix shoes (matrix-2,4,7,10,13), not the
		// full 55-doc collection — proves the separate $count aggregation respects the same
		// filter pipeline as the results themselves.
		const res = await postShoes({
			filters: { ...EMPTY_FILTERS, colors: { Black: true } },
			limit: 2,
			pageNum: 1,
		});

		expect(res.status).toBe(200);
		expect(res.body.totalDocs).toBe(5);
		expect(res.body.totalPages).toBe(3);
		expect(res.body.docs.length).toBe(2);
		expect(res.body.hasNextPage).toBe(true);
	});

	it('silently falls back to the default limit when limit is explicitly 0', async () => {
		// req.body.limit || 12 -- 0 is falsy in JS, so limit: 0 doesn't return zero items, it
		// silently reverts to the default of 12. Documenting this real, current behavior rather
		// than assuming limit: 0 would mean "no results" or an error.
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 0, pageNum: 1 });

		expect(res.status).toBe(200);
		expect(res.body.limit).toBe(12);
		expect(res.body.docs.length).toBe(12);
	});

	it('returns a 500 error for a non-numeric pageNum', async () => {
		// Unlike GET /shoes/page/:pageNum (which defaults to page 1 for invalid input), this
		// route does no validation/clamping on pageNum at all -- Number('abc') is NaN, which
		// MongoDB's $skip/$limit reject, so the aggregate() call throws.
		const res = await postShoes({ pageNum: 'abc' });

		expect(res.status).toBe(500);
	});

	it('returns a 500 error for a non-positive pageNum', async () => {
		// pageNum: 0 or negative produces a negative $skip, which MongoDB also rejects.
		const zeroRes = await postShoes({ pageNum: 0 });
		const negativeRes = await postShoes({ pageNum: -1 });

		expect(zeroRes.status).toBe(500);
		expect(negativeRes.status).toBe(500);
	});

	it('reports totalPages: 0 (not 1) when a filter matches nothing at all', async () => {
		// totalPages = Math.ceil(total / limit) -> Math.ceil(0 / 12) = 0. This route has no
		// "|| 1" fallback the way mongoose-paginate-v2 does (see the GET /shoes/page/:pageNum
		// comment/test in shoeRouter.base.test.ts, which always reports totalPages: 1 even when
		// empty) -- a real inconsistency between the two pagination-bearing routes in this file.
		const res = await postShoes({ filters: { ...EMPTY_FILTERS, brands: { Reebok: true } } });

		expect(res.status).toBe(200);
		expect(res.body.docs).toEqual([]);
		expect(res.body.totalDocs).toBe(0);
		expect(res.body.totalPages).toBe(0);
		expect(res.body.hasNextPage).toBe(false);
		expect(res.body.hasPrevPage).toBe(false);
	});

	it('returns everything on one page when limit exceeds the total available', async () => {
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 1000, pageNum: 1 });

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(volumeFillerShoes.length);
		expect(res.body.totalPages).toBe(1);
		expect(res.body.hasNextPage).toBe(false);
		expect(res.body.hasPrevPage).toBe(false);
	});

	it('accepts pageNum as a numeric string, same as a number', async () => {
		const res = await postShoes({ filters: FILLER_ONLY_FILTERS, limit: 12, pageNum: '2' });

		expect(res.status).toBe(200);
		// pageNum is coerced via Number(req.body.pageNum) before use, so `page` comes back as
		// the number 2, not the original string.
		expect(res.body.page).toBe(2);
		expect(res.body.docs.length).toBe(12);
		expect(res.body.hasPrevPage).toBe(true);
		expect(res.body.prevPage).toBe(1);
		expect(res.body.pagingCounter).toBe(13);
	});
});

describe('POST /shoes - error handling', () => {
	it('returns a 500 error when filters is missing entirely', async () => {
		// getSelectedFilters() (shoeRouter.ts:59-73) reads req.body.filters.colors etc. directly
		// with no guard, so a missing filters object throws before the query is even built. No
		// query is present here, so no fallback is attempted.
		const res = await request(app).post('/shoes').send({ pageNum: 1, limit: 12 });

		expect(res.status).toBe(500);
	});

	it('returns a 500 error when filters is missing even with a search query present', async () => {
		// The primary path throws on the missing filters, and since a query is present the
		// fallback is attempted too -- but the fallback also calls buildFilterMatch(), which
		// throws again for the same reason. Proves the inner catch handles this cleanly as well.
		const res = await request(app).post('/shoes').send({ pageNum: 1, limit: 12, query: 'Thunder' });

		expect(res.status).toBe(500);
	});

	it('returns a 500 error when filters is present but missing a required category', async () => {
		const res = await request(app)
			.post('/shoes')
			.send({
				pageNum: 1,
				limit: 12,
				filters: { brands: {}, genders: {}, priceRanges: {}, releaseYears: {} }, // colors missing
			});

		expect(res.status).toBe(500);
	});

	it('does not leak internal error details in the response body', async () => {
		const res = await request(app).post('/shoes').send({ pageNum: 1, limit: 12 });

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: 'Error fetching shoes' });
	});
});
