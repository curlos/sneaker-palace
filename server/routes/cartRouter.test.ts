import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Cart from '../models/Cart';
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
	await Cart.deleteMany({});
});

function signToken(userId: mongoose.Types.ObjectId | string) {
	return jwt.sign({ id: userId.toString(), isAdmin: false }, process.env.JWT_SEC as string);
}

describe('GET /cart', () => {
	it('returns null when the user has no cart', async () => {
		const token = signToken(new mongoose.Types.ObjectId());

		const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toBeNull();
	});

	it('returns the authenticated user\'s cart', async () => {
		const userId = new mongoose.Types.ObjectId();
		const product = { productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 };
		const cart = await Cart.create({
			userID: userId.toString(),
			products: [product],
		});
		const token = signToken(userId);

		const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body._id).toBe(cart._id.toString());
		expect(res.body.products).toEqual([expect.objectContaining(product)]);
	});

	it('returns a cart with an empty products array as an empty array, not null', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userId.toString(), products: [] });
		const token = signToken(userId);

		const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).not.toBeNull();
		expect(res.body.products).toEqual([]);
	});

	it('returns every product in a multi-product cart', async () => {
		const userId = new mongoose.Types.ObjectId();
		const products = [
			{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 },
			{ productID: 'shoe-2', size: '9', quantity: 2, retailPrice: 200 },
			{ productID: 'shoe-3', size: '11', quantity: 1, retailPrice: 300 },
		];
		await Cart.create({ userID: userId.toString(), products });
		const token = signToken(userId);

		const res = await request(app).get('/cart').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual(products.map((product) => expect.objectContaining(product)));
	});

	it('does not return another user\'s cart', async () => {
		const userA = new mongoose.Types.ObjectId();
		const userB = new mongoose.Types.ObjectId();

		await Cart.create({ userID: userA.toString(), products: [] });
		const cartB = await Cart.create({
			userID: userB.toString(),
			products: [{ productID: 'shoe-2', size: '9', quantity: 1, retailPrice: 200 }],
		});

		const tokenB = signToken(userB);

		const res = await request(app).get('/cart').set('Authorization', `Bearer ${tokenB}`);

		expect(res.status).toBe(200);
		expect(res.body._id).toBe(cartB._id.toString());
		expect(res.body.userID).toBe(userB.toString());
	});
});