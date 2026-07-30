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

describe('POST /shoes - sorting', () => {
	it.todo('TODO');
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
