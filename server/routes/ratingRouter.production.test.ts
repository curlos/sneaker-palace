import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { startTestServer, stopTestServer } from '../utils/testServer';

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	// ratingRouter.ts wraps PUT /reset-all-ratings in
	// `if (process.env.NODE_ENV !== 'production')`, evaluated once when the
	// module is first imported - so NODE_ENV must already be 'production'
	// before startTestServer() imports server.ts.
	({ app, mongod } = await startTestServer({ NODE_ENV: 'production' }));
});

afterAll(async () => {
	await stopTestServer(mongod);
});

describe('rating dev-only routes in production', () => {
	it('does not register PUT /rating/reset-all-ratings', async () => {
		const res = await request(app).put('/rating/reset-all-ratings');

		expect(res.status).toBe(404);
	});
});
