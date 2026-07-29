import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Shoe from '../models/Shoe';
import { IShoe } from '../types/types';
import { startTestServer, stopTestServer } from '../test/testServer';

let mongod: MongoMemoryServer;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

afterEach(async () => {
	await Shoe.deleteMany({});
});

function buildShoe(index: number): IShoe {
	return {
		shoeID: `shoe-${index}`,
		sku: `sku-${index}`,
		brand: 'Nike',
		name: `Shoe ${index}`,
		colorway: 'Black/White',
		gender: 'men',
		silhouette: 'Air Max 90',
		releaseYear: 2020,
		releaseDate: '2020-01-01',
		retailPrice: 100,
		estimatedMarketValue: 150,
		story: 'A great shoe.',
		image: {
			'360': [],
			original: `https://example.com/${index}/original.jpg`,
			small: `https://example.com/${index}/small.jpg`,
			thumbnail: `https://example.com/${index}/thumb.jpg`,
		},
		links: {},
		ratings: [],
		rating: 0,
		favorites: [],
		inStock: true,
	} as IShoe;
}

describe('GET /shoes/page/:pageNum', () => {
	it('returns an empty docs array when there are no shoes in the database', async () => {
		const res = await request(app).get('/shoes/page/1');

		expect(res.status).toBe(200);
		expect(res.body.docs).toEqual([]);
		expect(res.body.totalDocs).toBe(0);
		// mongoose-paginate-v2 always reports at least 1 page, even when empty
		// (Math.ceil(0 / limit) || 1).
		expect(res.body.totalPages).toBe(1);
	});

	it('returns the first 12 shoes with correct pagination metadata when more than 12 shoes exist', async () => {
		await Shoe.insertMany(Array.from({ length: 15 }, (_, i) => buildShoe(i)));

		const res = await request(app).get('/shoes/page/1');

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(12);
		expect(res.body.totalDocs).toBe(15);
		expect(res.body.limit).toBe(12);
		expect(res.body.page).toBe(1);
		expect(res.body.totalPages).toBe(2);
	});

	it('returns the remaining shoes and correct metadata on page 2', async () => {
		await Shoe.insertMany(Array.from({ length: 15 }, (_, i) => buildShoe(i)));

		const res = await request(app).get('/shoes/page/2');

		expect(res.status).toBe(200);
		expect(res.body.docs.length).toBe(3);
		expect(res.body.page).toBe(2);
	});

	it('selects only the allowed fields on each doc', async () => {
		await Shoe.create(buildShoe(0));

		const res = await request(app).get('/shoes/page/1');
		const doc = res.body.docs[0];

		expect(Object.keys(doc).sort()).toEqual(
			['_id', 'brand', 'colorway', 'gender', 'id', 'image', 'name', 'rating', 'ratings', 'retailPrice', 'shoeID'].sort()
		);
		expect(doc.image).toEqual({ original: 'https://example.com/0/original.jpg' });
	});

	it('returns an empty docs array when requesting a page beyond the available data', async () => {
		await Shoe.insertMany(Array.from({ length: 2 }, (_, i) => buildShoe(i)));

		const res = await request(app).get('/shoes/page/3');

		expect(res.status).toBe(200);
		expect(res.body.docs).toEqual([]);
	});

	it.only('defaults to page 1 when pageNum is not a valid number', async () => {
		await Shoe.insertMany(Array.from({ length: 2 }, (_, i) => buildShoe(i)));

		const res = await request(app).get('/shoes/page/abc');

		console.log(res.body)

		expect(res.status).toBe(200);
		expect(res.body.page).toBe(1);
	});
});

describe('GET /shoes/:shoeID', () => {
	it.todo('TODO');
});

describe('POST /shoes/objectIDs', () => {
	it.todo('TODO');
});

describe('POST /shoes/bulk', () => {
	it.todo('TODO');
});

describe('PUT /shoes/favorite/:shoeID', () => {
	it.todo('TODO');
});
