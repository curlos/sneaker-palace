import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import User from '../models/User';
import { startTestServer, stopTestServer } from '../utils/testServer';
import { signToken } from '../utils/authAssertions';

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

let userCounter = 0;

async function createUser(overrides: Record<string, unknown> = {}) {
	userCounter += 1;
	const email = `user${userCounter}@example.com`;

	return User.create({
		email,
		lowerCaseEmail: email,
		password: 'password123',
		firstName: 'Test',
		lastName: 'User',
		...overrides,
	});
}

const STRIPPED_PUBLIC_PROFILE_FIELDS = ['password', 'email', 'lowerCaseEmail', 'isAdmin', 'orders'] as const;

function expectStrippedPublicProfileFields(body: Record<string, unknown>) {
	for (const field of STRIPPED_PUBLIC_PROFILE_FIELDS) {
		expect(body[field]).toBeUndefined();
	}
}

describe('GET /:userID', () => {
	it('returns a 404 error when the user does not exist', async () => {
		const userId = new mongoose.Types.ObjectId();

		const res = await request(app).get(`/users/${userId}`);

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it('returns a 500 error when the userID is not a valid ObjectId', async () => {
		const res = await request(app).get('/users/not-a-valid-object-id');

		expect(res.status).toBe(500);
	});

	it('returns the public profile without requiring authentication', async () => {
		const user = await createUser();

		const res = await request(app).get(`/users/${user._id}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ _id: user._id.toString() }));
		expectStrippedPublicProfileFields(res.body);
	});

	it('returns the public profile when the Authorization header contains an invalid token', async () => {
		const user = await createUser();
		const badToken = signToken(new mongoose.Types.ObjectId(), 'wrong-secret');

		const res = await request(app).get(`/users/${user._id}`).set('Authorization', `Bearer ${badToken}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ _id: user._id.toString() }));
		expectStrippedPublicProfileFields(res.body);
	});

	it('returns the full profile when the authenticated user is viewing their own profile', async () => {
		const user = await createUser({ preselectedShoeSize: '10', preferredGender: "Men's", unitOfMeasure: 'in' });
		const token = signToken(user._id);

		const res = await request(app).get(`/users/${user._id}`).set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(
			expect.objectContaining({
				email: user.email,
				helpful: [],
				notHelpful: [],
				favorites: [],
				preselectedShoeSize: '10',
				preferredGender: "Men's",
				unitOfMeasure: 'in',
			})
		);
	});

	it('does not include the password even on the authenticated user\'s own profile', async () => {
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app).get(`/users/${user._id}`).set('Authorization', `Bearer ${token}`);

		expect(res.body.password).toBeUndefined();
	});

	it('returns the public profile when the authenticated user is viewing someone else\'s profile', async () => {
		const user = await createUser();
		const otherUser = await createUser();
		const token = signToken(otherUser._id);

		const res = await request(app).get(`/users/${user._id}`).set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ _id: user._id.toString() }));
		expectStrippedPublicProfileFields(res.body);
	});
});
