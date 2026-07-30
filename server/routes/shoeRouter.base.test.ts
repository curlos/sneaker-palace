import request from 'supertest';
import mongoose from 'mongoose';
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

	it('defaults to page 1 when pageNum is not a valid number', async () => {
		await Shoe.insertMany(Array.from({ length: 2 }, (_, i) => buildShoe(i)));

		const res = await request(app).get('/shoes/page/abc');

		expect(res.status).toBe(200);
		expect(res.body.page).toBe(1);
	});
});

describe('GET /shoes/:shoeID', () => {
	it('returns the shoe when a shoe with the given shoeID exists', async () => {
		const created = await Shoe.create(buildShoe(0));

		const res = await request(app).get('/shoes/shoe-0');

		expect(res.status).toBe(200);
		expect(res.body.shoeID).toBe('shoe-0');
		expect(res.body._id).toBe(created._id.toString());
	});

	it('returns null when no shoe matches the given shoeID', async () => {
		const res = await request(app).get('/shoes/does-not-exist');

		expect(res.status).toBe(200);
		expect(res.body).toBeNull();
	});
});

describe('POST /shoes/bulk', () => {
	it('returns a 400 error when ids is missing', async () => {
		const res = await request(app).post('/shoes/bulk').send({});

		expect(res.status).toBe(400);
	});

	it('returns a 400 error when ids is not an array', async () => {
		const res = await request(app).post('/shoes/bulk').send({ ids: 'not-an-array' });

		expect(res.status).toBe(400);
	});

	it('returns a 400 error when key is not "_id" or "shoeID"', async () => {
		const res = await request(app).post('/shoes/bulk').send({ ids: [], key: 'foo' });

		expect(res.status).toBe(400);
	});

	it('returns a 400 error when key is explicitly null', async () => {
		const res = await request(app).post('/shoes/bulk').send({ ids: [], key: null });

		expect(res.status).toBe(400);
	});

	it('returns all shoes matching the given ids when key is explicitly "_id"', async () => {
		const created = await Shoe.insertMany(Array.from({ length: 5 }, (_, i) => buildShoe(i)));
		const ids = created.map((shoe) => shoe._id.toString());

		const res = await request(app).post('/shoes/bulk').send({ ids, key: '_id' });

		expect(res.status).toBe(200);
		expect(res.body.length).toBe(5);
		expect(res.body.map((shoe: IShoe) => shoe.shoeID).sort()).toEqual(
			created.map((shoe) => shoe.shoeID).sort()
		);
	});

	it('returns all shoes matching the given ids when key is omitted (defaults to _id)', async () => {
		const created = await Shoe.insertMany(Array.from({ length: 5 }, (_, i) => buildShoe(i)));
		const ids = created.map((shoe) => shoe._id.toString());

		const res = await request(app).post('/shoes/bulk').send({ ids });

		expect(res.status).toBe(200);
		expect(res.body.length).toBe(5);
		expect(res.body.map((shoe: IShoe) => shoe.shoeID).sort()).toEqual(
			created.map((shoe) => shoe.shoeID).sort()
		);
	});

	it('returns only the shoes that exist when some ids do not match any shoe (default _id key)', async () => {
		const [shoe1, shoe2, excludedShoe] = await Shoe.insertMany(
			Array.from({ length: 3 }, (_, i) => buildShoe(i))
		);
		const ids = [
			shoe1._id.toString(),
			shoe2._id.toString(),
			new mongoose.Types.ObjectId().toString(),
			new mongoose.Types.ObjectId().toString(),
		];

		const res = await request(app).post('/shoes/bulk').send({ ids });

		expect(res.status).toBe(200);
		expect(res.body.length).toBe(2);
		expect(res.body.map((shoe: IShoe) => shoe.shoeID).sort()).toEqual(
			[shoe1.shoeID, shoe2.shoeID].sort()
		);
		expect(res.body.some((shoe: IShoe) => shoe.shoeID === excludedShoe.shoeID)).toBe(false);
	});

	it('returns an empty array when ids is an empty array (default _id key)', async () => {
		await Shoe.insertMany(Array.from({ length: 2 }, (_, i) => buildShoe(i)));

		const res = await request(app).post('/shoes/bulk').send({ ids: [] });

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('returns a 500 error when ids contains values that are not valid MongoDB ObjectIds (default _id key)', async () => {
		const res = await request(app).post('/shoes/bulk').send({ ids: ['not-a-valid-id', 123, true] });

		expect(res.status).toBe(500);
	});

	it('returns all shoes matching the given shoeIDs when key is "shoeID"', async () => {
		const created = await Shoe.insertMany(Array.from({ length: 5 }, (_, i) => buildShoe(i)));
		const ids = created.map((shoe) => shoe.shoeID);

		const res = await request(app).post('/shoes/bulk').send({ ids, key: 'shoeID' });

		expect(res.status).toBe(200);
		expect(res.body.length).toBe(5);
		expect(res.body.map((shoe: IShoe) => shoe.shoeID).sort()).toEqual(ids.sort());
	});

	it('returns only the shoes that exist when some shoeIDs do not match any shoe (key: "shoeID")', async () => {
		const [shoe1, shoe2, excludedShoe] = await Shoe.insertMany(
			Array.from({ length: 3 }, (_, i) => buildShoe(i))
		);
		const ids = [shoe1.shoeID, shoe2.shoeID, 'does-not-exist-1', 'does-not-exist-2'];

		const res = await request(app).post('/shoes/bulk').send({ ids, key: 'shoeID' });

		expect(res.status).toBe(200);
		expect(res.body.length).toBe(2);
		expect(res.body.map((shoe: IShoe) => shoe.shoeID).sort()).toEqual(
			[shoe1.shoeID, shoe2.shoeID].sort()
		);
		expect(res.body.some((shoe: IShoe) => shoe.shoeID === excludedShoe.shoeID)).toBe(false);
	});

	it('does not error when ids contains arbitrary non-ObjectId strings and key is "shoeID"', async () => {
		const res = await request(app)
			.post('/shoes/bulk')
			.send({ ids: ['not-a-valid-id', 'also-not-valid'], key: 'shoeID' });

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('returns an empty array when ids is an empty array (key: "shoeID")', async () => {
		await Shoe.insertMany(Array.from({ length: 2 }, (_, i) => buildShoe(i)));

		const res = await request(app).post('/shoes/bulk').send({ ids: [], key: 'shoeID' });

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});
});

describe('PUT /shoes/favorite/:shoeID', () => {
	it.todo('TODO');
});
