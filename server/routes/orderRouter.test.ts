import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import User from '../models/User';
import Cart from '../models/Cart';
import Order from '../models/Order';
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
	await Cart.deleteMany({});
	await Order.deleteMany({});
});

let paymentIntentCounter = 0;

function orderPayload(overrides: Record<string, unknown> = {}) {
	paymentIntentCounter += 1;

	return {
		products: [{ productID: 'shoe-1', quantity: 1, size: '10', retailPrice: 100 }],
		amount: 100,
		card: { brand: 'visa', last4: 4242, exp_month: 1, exp_year: 2077, country: 'US' },
		billingDetails: { name: 'Test User', email: 'test@example.com' },
		paymentIntentID: `pi_test_${paymentIntentCounter}`,
		orderDate: new Date().toString(),
		deliveryDate: new Date().toString(),
		...overrides,
	};
}

let userCounter = 0;

async function createUserWithCart(cartProducts: Record<string, unknown>[] = []) {
	userCounter += 1;
	const email = `user${userCounter}@example.com`;

	const user = await User.create({
		email,
		lowerCaseEmail: email,
		password: 'password123',
		firstName: 'Test',
		lastName: 'User',
	});

	const cart = await Cart.create({
		userID: user._id.toString(),
		products: cartProducts,
	});

	const token = signToken(user._id);

	return { user, cart, token };
}

describe('POST /orders', () => {
	it('creates the order and returns it with the authenticated user as owner', async () => {
		const { user, token } = await createUserWithCart([]);
		const payload = orderPayload();

		const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		expect(res.status).toBe(200);
		expect(res.body.order).toEqual(
			expect.objectContaining({
				userID: user._id.toString(),
				paymentIntentID: payload.paymentIntentID,
				amount: payload.amount,
				orderDate: payload.orderDate,
				deliveryDate: payload.deliveryDate,
				products: payload.products.map((product) => expect.objectContaining(product)),
			})
		);
	});

	it('persists the new order to the database', async () => {
		const { token } = await createUserWithCart([]);
		const payload = orderPayload();

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		const dbOrder = await Order.findOne({ paymentIntentID: payload.paymentIntentID });
		expect(dbOrder).not.toBeNull();
	});

	it('empties the cart after placing the order', async () => {
		const cartProducts = [{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }];
		const { user, token } = await createUserWithCart(cartProducts);

		const res = await request(app)
			.post('/orders')
			.set('Authorization', `Bearer ${token}`)
			.send(orderPayload({ products: cartProducts }));

		expect(res.body.updatedCart.products).toEqual([]);

		const dbCart = await Cart.findOne({ userID: user._id.toString() });
		expect(dbCart!.products).toEqual([]);
	});

	it("adds the new order to the user's orders array", async () => {
		const { user, token } = await createUserWithCart([]);

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(orderPayload());

		const dbUser = await User.findById(user._id);
		expect(dbUser!.orders).toHaveLength(1);
	});

	it("does not empty another user's cart", async () => {
		const otherCartProducts = [{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }];
		const { token } = await createUserWithCart([]);
		const { user: otherUser } = await createUserWithCart(otherCartProducts);

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(orderPayload());

		const otherDbCart = await Cart.findOne({ userID: otherUser._id.toString() });
		expect(otherDbCart!.products).toEqual(otherCartProducts.map((product) => expect.objectContaining(product)));
	});

	it("does not add the order to another user's orders array", async () => {
		const { token } = await createUserWithCart([]);
		const { user: otherUser } = await createUserWithCart([]);

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(orderPayload());

		const otherDbUser = await User.findById(otherUser._id);
		expect(otherDbUser!.orders).toHaveLength(0);
	});

	it('returns a 404 error when the user has no cart yet', async () => {
		const user = await User.create({
			email: 'nocart@example.com',
			lowerCaseEmail: 'nocart@example.com',
			password: 'password123',
			firstName: 'Test',
			lastName: 'User',
		});
		const token = signToken(user._id);

		const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(orderPayload());

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it('returns a 404 error when the authenticated user does not exist', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userId.toString(), products: [] });
		const token = signToken(userId);

		const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(orderPayload());

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it('returns the existing order without creating a duplicate when paymentIntentID already exists', async () => {
		const cartProducts = [{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }];
		const { token } = await createUserWithCart(cartProducts);

		const payload = orderPayload();
		const existingOrder = await Order.create({
			...payload,
			userID: new mongoose.Types.ObjectId().toString(),
		});

		const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		expect(res.status).toBe(200);
		expect(res.body.error).toMatch(/ordered/i);
		expect(res.body.orderID).toBe(existingOrder._id.toString());

		const orderCount = await Order.countDocuments({ paymentIntentID: payload.paymentIntentID });
		expect(orderCount).toBe(1);
	});

	it('does not empty the cart when the order already exists', async () => {
		const cartProducts = [{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }];
		const { user, token } = await createUserWithCart(cartProducts);

		const payload = orderPayload();
		await Order.create({ ...payload, userID: new mongoose.Types.ObjectId().toString() });

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		const dbCart = await Cart.findOne({ userID: user._id.toString() });
		expect(dbCart!.products).toEqual(cartProducts.map((product) => expect.objectContaining(product)));
	});

	it("does not add to the user's orders array when the order already exists", async () => {
		const { user, token } = await createUserWithCart([]);

		const payload = orderPayload();
		await Order.create({ ...payload, userID: new mongoose.Types.ObjectId().toString() });

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		const dbUser = await User.findById(user._id);
		expect(dbUser!.orders).toHaveLength(0);
	});

	it("ignores a userID sent in the request body (cannot reassign order ownership)", async () => {
		const { user, token } = await createUserWithCart([]);
		const otherUserId = new mongoose.Types.ObjectId();

		const res = await request(app)
			.post('/orders')
			.set('Authorization', `Bearer ${token}`)
			.send(orderPayload({ userID: otherUserId.toString() }));

		expect(res.status).toBe(200);
		expect(res.body.order.userID).toBe(user._id.toString());
	});

	it('returns a 500 error when order validation fails', async () => {
		const { token } = await createUserWithCart([]);

		const payload: Record<string, unknown> = orderPayload();
		delete payload.paymentIntentID;

		const res = await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/failed/i);
	});

	it('does not modify the cart when order validation fails', async () => {
		const cartProducts = [{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 }];
		const { user, token } = await createUserWithCart(cartProducts);

		const payload: Record<string, unknown> = orderPayload();
		delete payload.paymentIntentID;

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		const dbCart = await Cart.findOne({ userID: user._id.toString() });
		expect(dbCart!.products).toEqual(cartProducts.map((product) => expect.objectContaining(product)));
	});

	it('does not add the order to the user when order validation fails', async () => {
		const { user, token } = await createUserWithCart([]);

		const payload: Record<string, unknown> = orderPayload();
		delete payload.paymentIntentID;

		await request(app).post('/orders').set('Authorization', `Bearer ${token}`).send(payload);

		const dbUser = await User.findById(user._id);
		expect(dbUser!.orders).toHaveLength(0);
	});
});
