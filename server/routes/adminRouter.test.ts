import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { startTestServer, stopTestServer } from '../test/testServer';

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	// adminRouter.ts wraps all of its dev-only routes in
	// `if (process.env.NODE_ENV !== 'production')`, evaluated once when the
	// module is first imported - so NODE_ENV must already be 'production'
	// before startTestServer() imports server.ts.
	({ app, mongod } = await startTestServer({ NODE_ENV: 'production' }));
});

afterAll(async () => {
	await stopTestServer(mongod);
});

describe('admin dev-only routes in production', () => {
	it.each([
		['post', '/admin/migrate-passwords'],
		['post', '/admin/shoes/newShoes'],
		['post', '/admin/shoes/newShoes/brand'],
		['post', '/admin/shoes/newShoe'],
		['post', '/admin/shoes/delete'],
		['get', '/admin/shoes/grouped-by-brand'],
	] as const)('does not register %s %s', async (method, path) => {
		const res = await request(app)[method](path);

		expect(res.status).toBe(404);
	});
});
