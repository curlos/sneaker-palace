import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import User from './User';
import { startTestServer, stopTestServer } from '../utils/testServer';
import { signToken } from '../utils/authAssertions';

function buildUser(overrides: Record<string, unknown> = {}) {
	return new User({
		email: 'test@example.com',
		lowerCaseEmail: 'test@example.com',
		password: 'hashed-password',
		firstName: 'Test',
		lastName: 'User',
		...overrides,
	});
}

describe('User toJSON', () => {
	it('strips the password when the document is serialized (e.g. res.json)', () => {
		const user = buildUser();

		expect(user.toJSON().password).toBeUndefined();
		expect(JSON.stringify(user)).not.toContain('hashed-password');
	});

	it('keeps the password accessible directly on the document (e.g. for login/register)', () => {
		const user = buildUser();

		expect(user.password).toBe('hashed-password');
		expect(user.toObject().password).toBe('hashed-password');
	});

	describe('via a real endpoint (res.json)', () => {
		let mongod: MongoMemoryReplSet;
		let app: Awaited<ReturnType<typeof startTestServer>>['app'];

		beforeAll(async () => {
			({ app, mongod } = await startTestServer());
		});

		afterAll(async () => {
			await stopTestServer(mongod);
		});

		afterEach(async () => {
			await User.deleteMany({});
		});

		it('does not include the password in the response body of GET /users/:userID', async () => {
			const user = await User.create({
				email: 'endpoint-test@example.com',
				lowerCaseEmail: 'endpoint-test@example.com',
				password: 'hashed-password',
				firstName: 'Test',
				lastName: 'User',
			});
			const token = signToken(user._id);

			const res = await request(app).get(`/users/${user._id}`).set('Authorization', `Bearer ${token}`);

			expect(res.status).toBe(200);
			expect(res.body._id).toBe(user._id.toString());
			expect(res.body.password).toBeUndefined();
		});
	});
});
