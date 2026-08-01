import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Rating from '../models/Rating';
import User from '../models/User';
import Shoe from '../models/Shoe';
import { startTestServer, stopTestServer } from '../utils/testServer';
import { buildUser } from '../utils/userFixtures';
import { buildShoe } from '../utils/shoeFixtures';
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
	await Rating.deleteMany({});
	await User.deleteMany({});
	await Shoe.deleteMany({});
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

async function createUser(overrides: Record<string, unknown> = {}) {
	return User.create(buildUser(overrides));
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

describe('GET /by/:type/:id', () => {
	it('returns a 400 error when type is not "shoe" or "user"', async () => {
		const res = await request(app).get('/rating/by/invalid-type/some-id');

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/invalid type/i);
	});

	it('returns only the ratings matching the given shoeID when type is "shoe"', async () => {
		const user = await createUser();
		await createRating({ userID: user._id.toString(), shoeID: 'target-shoe' });
		await createRating({ userID: user._id.toString(), shoeID: 'target-shoe' });
		await createRating({ userID: user._id.toString(), shoeID: 'other-shoe' });

		const res = await request(app).get('/rating/by/shoe/target-shoe');

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(2);
		expect(res.body.every((rating: { shoeID: string }) => rating.shoeID === 'target-shoe')).toBe(true);
	});

	it('returns an empty array when no ratings match', async () => {
		const res = await request(app).get('/rating/by/shoe/no-such-shoe');

		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('returns only the ratings matching the given userID when type is "user"', async () => {
		const targetUser = await createUser();
		const otherUser = await createUser();
		await createRating({ userID: targetUser._id.toString() });
		await createRating({ userID: otherUser._id.toString() });

		const res = await request(app).get(`/rating/by/user/${targetUser._id}`);

		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].userID).toBe(targetUser._id.toString());
	});

	it('attaches only the whitelisted postedByUser fields to each rating', async () => {
		const user = await createUser({ firstName: 'Jane', profilePic: 'https://example.com/pic.png' });
		await createRating({ userID: user._id.toString() });

		const res = await request(app).get(`/rating/by/user/${user._id}`);

		expect(res.status).toBe(200);
		expect(Object.keys(res.body[0].postedByUser).sort()).toEqual(
			['_id', 'firstName', 'lastName', 'profilePic'].sort()
		);
	});

	it('only queries User once even when multiple ratings share the same author', async () => {
		const user = await createUser();
		await createRating({ userID: user._id.toString(), shoeID: 'shared-shoe' });
		await createRating({ userID: user._id.toString(), shoeID: 'shared-shoe' });
		const findSpy = vi.spyOn(User, 'find');

		const res = await request(app).get('/rating/by/shoe/shared-shoe');

		expect(res.status).toBe(200);
		expect(findSpy).toHaveBeenCalledTimes(1);
	});

	it('returns postedByUser as null when the rating author no longer exists', async () => {
		await createRating({ userID: new mongoose.Types.ObjectId().toString(), shoeID: 'orphan-shoe' });

		const res = await request(app).get('/rating/by/shoe/orphan-shoe');

		expect(res.status).toBe(200);
		expect(res.body[0].postedByUser).toBeNull();
	});

	it('maps each rating to its own author when a shoe has ratings from different users', async () => {
		const userA = await createUser({ firstName: 'Alice' });
		const userB = await createUser({ firstName: 'Bob' });
		await createRating({ userID: userA._id.toString(), shoeID: 'multi-author-shoe' });
		await createRating({ userID: userB._id.toString(), shoeID: 'multi-author-shoe' });

		const res = await request(app).get('/rating/by/shoe/multi-author-shoe');

		expect(res.status).toBe(200);
		const ratingA = res.body.find((rating: { userID: string }) => rating.userID === userA._id.toString());
		const ratingB = res.body.find((rating: { userID: string }) => rating.userID === userB._id.toString());
		expect(ratingA.postedByUser.firstName).toBe('Alice');
		expect(ratingB.postedByUser.firstName).toBe('Bob');
	});

	it('returns a 500 error when the database query fails', async () => {
		vi.spyOn(Rating, 'find').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).get('/rating/by/shoe/some-shoe');

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/rating/i);
	});

	it('returns a 500 error when the author lookup query fails', async () => {
		await createRating({ shoeID: 'some-shoe' });
		vi.spyOn(User, 'find').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).get('/rating/by/shoe/some-shoe');

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/rating/i);
	});
});

describe('POST /rate', () => {
	it('creates a rating and returns updatedShoe, updatedUser, and the rating', async () => {
		const shoe = await Shoe.create(buildShoe('post-rate-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 5, summary: 'Great', text: 'Loved it' });

		expect(res.status).toBe(200);
		expect(res.body.rating).toEqual(
			expect.objectContaining({ shoeID: shoe.shoeID, userID: user._id.toString(), ratingNum: 5, summary: 'Great', text: 'Loved it' })
		);
		expect(res.body.updatedShoe).toEqual(expect.objectContaining({ shoeID: shoe.shoeID }));
		expect(res.body.updatedUser).toEqual(expect.objectContaining({ _id: user._id.toString() }));
	});

	it('sets userID from the authenticated user, ignoring any userID sent in the body', async () => {
		const shoe = await Shoe.create(buildShoe('ignore-body-userid-shoe'));
		const user = await createUser();
		const otherUser = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 3, userID: otherUser._id.toString() });

		expect(res.status).toBe(200);
		expect(res.body.rating.userID).toBe(user._id.toString());
	});

	it("sets the shoe's average rating to the submitted ratingNum when the shoe had no existing ratings", async () => {
		const shoe = await Shoe.create(buildShoe('no-existing-ratings-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 4 });

		expect(res.status).toBe(200);
		expect(res.body.updatedShoe.rating).toBe(4);
	});

	it("averages the new rating together with the shoe's existing rating", async () => {
		const shoe = await Shoe.create({
			...buildShoe('existing-rating-shoe'),
			rating: 4,
			ratings: [new mongoose.Types.ObjectId()],
		});
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 2 });

		expect(res.status).toBe(200);
		expect(res.body.updatedShoe.rating).toBe(3);
	});

	it("adds the new rating's _id to the shoe's ratings array", async () => {
		const shoe = await Shoe.create(buildShoe('shoe-ratings-array-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 5 });

		const dbShoe = await Shoe.findById(shoe._id);
		expect(dbShoe!.ratings.map(String)).toContain(res.body.rating._id);
	});

	it("adds the new rating's _id to the user's ratings array", async () => {
		const shoe = await Shoe.create(buildShoe('user-ratings-array-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 5 });

		const dbUser = await User.findById(user._id);
		expect(dbUser!.ratings.map(String)).toContain(res.body.rating._id);
	});

	it('returns a 404 error when the shoe does not exist', async () => {
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: 'no-such-shoe', ratingNum: 5 });

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it('returns a 404 error when the authenticated user no longer exists', async () => {
		const shoe = await Shoe.create(buildShoe('missing-user-shoe'));
		const token = signToken(new mongoose.Types.ObjectId());

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 5 });

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it('returns a 500 error when the rating fails schema validation', async () => {
		const shoe = await Shoe.create(buildShoe('validation-fail-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID });

		expect(res.status).toBe(500);
	});

	it('returns a 500 error when a database operation fails', async () => {
		const user = await createUser();
		const token = signToken(user._id);
		vi.spyOn(Shoe, 'findOne').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: 'some-shoe', ratingNum: 5 });

		expect(res.status).toBe(500);
	});

	it('returns a 404 error when the user no longer exists at the final lookup', async () => {
		const shoe = await Shoe.create(buildShoe('toctou-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		vi.spyOn(User, 'findById')
			.mockResolvedValueOnce(user as unknown as null)
			.mockResolvedValueOnce(null);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ shoeID: shoe.shoeID, ratingNum: 5 });

		expect(res.status).toBe(404);
		expect(res.body.error).toBe('User not found');
	});

	it('returns a 404 error when shoeID is omitted from the body', async () => {
		await Shoe.create(buildShoe('omitted-shoeid-shoe'));
		const user = await createUser();
		const token = signToken(user._id);

		const res = await request(app)
			.post('/rating/rate')
			.set('Authorization', `Bearer ${token}`)
			.send({ ratingNum: 5 });

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});
});
