import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Rating from '../models/Rating';
import { startTestServer, stopTestServer } from '../utils/testServer';

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

afterEach(async () => {
	await Rating.deleteMany({});
});

let ratingCounter = 0;

async function createRating(overrides: Record<string, unknown> = {}) {
	ratingCounter += 1;

	return Rating.create({
		userID: new mongoose.Types.ObjectId().toString(),
		shoeID: `shoe-${ratingCounter}`,
		ratingNum: 4,
		summary: 'Great shoe',
		text: 'Loved it',
		...overrides,
	});
}

describe('GET /:ratingID', () => {
	it('returns the rating when it exists', async () => {
		const rating = await createRating({ ratingNum: 5, summary: 'Amazing' });

		const res = await request(app).get(`/rating/${rating._id}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(
			expect.objectContaining({ _id: rating._id.toString(), ratingNum: 5, summary: 'Amazing' })
		);
	});

	it('returns null when the rating does not exist', async () => {
		const ratingId = new mongoose.Types.ObjectId();

		const res = await request(app).get(`/rating/${ratingId}`);

		expect(res.status).toBe(200);
		expect(res.body).toBeNull();
	});

	it('returns a 500 error when the ratingID is not a valid ObjectId', async () => {
		const res = await request(app).get('/rating/not-a-valid-object-id');

		expect(res.status).toBe(500);
	});
});
