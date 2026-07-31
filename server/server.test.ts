import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Shoe from './models/Shoe';
import { startTestServer, stopTestServer } from './utils/testServer';

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

describe('global error handler', () => {
	it('returns a JSON 500 when a route handler throws an uncaught error', async () => {
		vi.spyOn(Shoe, 'findOne').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).get('/shoes/shoe-0');

		expect(res.status).toBe(500);
		expect(res.body).toEqual({ error: 'Internal server error' });
	});
});

describe('unknown routes', () => {
	it('returns a 404 for a route that does not exist', async () => {
		const res = await request(app).get('/this-route-does-not-exist');

		expect(res.status).toBe(404);
	});
});
