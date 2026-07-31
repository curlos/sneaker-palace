import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { startTestServer, stopTestServer } from '../test/testServer';
import { itRequiresAuth } from '../test/authAssertions';

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

// Every route in the API gated by plain `verifyToken`, centralized here so the
// full auth surface can be audited in one place instead of scattered across
// each router's own test file. Each route's other (non-auth) behavior is still
// tested in its own router's test file - this only covers the auth boundary.
//
// Not included: GET /orders/:orderID (verifyOrderAccess) - its auth is
// conditional on the order having a userID (guest orders skip it entirely),
// so it needs its own bespoke tests rather than this "always requires auth"
// helper.
describe.each([
	['get', '/cart'],
	['put', '/cart'],
	['put', '/shoes/favorite/does-not-matter'],
	['put', '/users'],
	['put', '/users/password'],
	['post', '/rating/rate'],
	['put', '/rating/edit/does-not-matter'],
	['put', '/rating/like'],
	['put', '/rating/dislike'],
	['delete', '/rating/does-not-matter'],
	['get', '/orders/user'],
	['post', '/orders'],
] as const)('%s %s', (method, path) => {
	itRequiresAuth(() => app, method, path);
});
