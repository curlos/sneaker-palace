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

describe('PUT /', () => {
	it('updates the allowed profile fields for the authenticated user', async () => {
		const user = await createUser({ firstName: 'Old', lastName: 'Name' });
		const token = signToken(user._id);

		const update = {
			firstName: 'New',
			lastName: 'Name2',
			profilePic: 'https://example.com/pic.png',
			preselectedShoeSize: '11',
			preferredGender: "Women's",
			unitOfMeasure: 'cm',
		};

		const res = await request(app).put('/users').set('Authorization', `Bearer ${token}`).send(update);

		expect(res.status).toBe(200);
		expect(res.body.user).toEqual(expect.objectContaining(update));

		const dbUser = await User.findById(user._id);
		expect(dbUser).toEqual(expect.objectContaining(update));
	});

	it.each([
		['firstName', '', /first name/i],
		['firstName', '   ', /first name/i],
		['lastName', '', /last name/i],
		['lastName', '   ', /last name/i],
	] as const)('returns a 400 error and does not persist the change when %s is %j', async (field, value, errorMatch) => {
		const user = await createUser({ [field]: 'Old' });
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ [field]: value });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(errorMatch);

		const dbUser = await User.findById(user._id);
		expect(dbUser![field]).toBe('Old');
	});

	it('leaves fields not included in the request body unchanged', async () => {
		const user = await createUser({ firstName: 'Old', lastName: 'Name' });
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ firstName: 'New' });

		expect(res.status).toBe(200);
		expect(res.body.user.lastName).toBe('Name');
	});

	it('leaves the profile unchanged when the body is empty', async () => {
		const user = await createUser({ firstName: 'Old', lastName: 'Name' });
		const token = signToken(user._id);

		const res = await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({});

		expect(res.status).toBe(200);
		expect(res.body.user.firstName).toBe('Old');
		expect(res.body.user.lastName).toBe('Name');
	});

	it('ignores fields not on the allowlist (mass assignment protection)', async () => {
		const user = await createUser({ isAdmin: false });
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ firstName: 'New', isAdmin: true });

		expect(res.status).toBe(200);
		expect(res.body.user.isAdmin).toBe(false);

		const dbUser = await User.findById(user._id);
		expect(dbUser!.isAdmin).toBe(false);
	});

	it('does not include the password in the response', async () => {
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ firstName: 'New' });

		expect(res.body.user.password).toBeUndefined();
	});

	it('returns a 400 error when the new email is not a valid email address', async () => {
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ email: 'not-an-email' });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/valid email/i);
	});

	it('returns a 400 error and does not persist the change when the new email is already used by another user', async () => {
		const user = await createUser();
		const otherUser = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ email: otherUser.email });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/email already exists/i);

		const dbUser = await User.findById(user._id);
		expect(dbUser!.email).toBe(user.email);
	});

	it('returns a 400 error when the new email matches another user\'s email in a different case', async () => {
		const user = await createUser();
		const otherUser = await createUser({ email: 'existing@example.com', lowerCaseEmail: 'existing@example.com' });
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ email: otherUser.email.toUpperCase() });

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/email already exists/i);

		const dbUser = await User.findById(user._id);
		expect(dbUser!.email).toBe(user.email);
	});

	it("allows sending the user's current email back without a false conflict", async () => {
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ email: user.email });

		expect(res.status).toBe(200);
		expect(res.body.user.email).toBe(user.email);
	});

	it('updates lowerCaseEmail alongside email when the email is changed to a new value', async () => {
		const user = await createUser();
		const token = signToken(user._id);
		const newEmail = 'New.Mixed.Case@Example.com';

		const res = await request(app).put('/users').set('Authorization', `Bearer ${token}`).send({ email: newEmail });

		expect(res.status).toBe(200);

		const dbUser = await User.findById(user._id);
		expect(dbUser!.lowerCaseEmail).toBe(newEmail.toLowerCase());
	});

	it('returns a 404 error when the authenticated user no longer exists', async () => {
		const token = signToken(new mongoose.Types.ObjectId());

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ firstName: 'New' });

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it("cannot update another user's profile by sending their _id in the request body", async () => {
		const userA = await createUser({ firstName: 'Original' });
		const userB = await createUser({ firstName: 'Untouched' });
		const token = signToken(userA._id);

		const res = await request(app)
			.put('/users')
			.set('Authorization', `Bearer ${token}`)
			.send({ _id: userB._id.toString(), firstName: 'Updated' });

		expect(res.status).toBe(200);
		expect(res.body.user._id).toBe(userA._id.toString());

		const dbUserB = await User.findById(userB._id);
		expect(dbUserB!.firstName).toBe('Untouched');
	});
});
