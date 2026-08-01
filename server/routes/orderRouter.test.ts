import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
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

describe('POST /orders/no-account', () => {
	it('creates the order and returns 200 without requiring authentication', async () => {
		const res = await request(app).post('/orders/no-account').send(orderPayload());

		expect(res.status).toBe(200);
	});

	it('returns the created order matching the submitted payload', async () => {
		const payload = orderPayload();

		const res = await request(app).post('/orders/no-account').send(payload);

		expect(res.body.order).toEqual(
			expect.objectContaining({
				paymentIntentID: payload.paymentIntentID,
				amount: payload.amount,
				orderDate: payload.orderDate,
				deliveryDate: payload.deliveryDate,
				products: payload.products.map((product) => expect.objectContaining(product)),
			})
		);
	});

	it('persists the guest order to the database', async () => {
		const payload = orderPayload();

		await request(app).post('/orders/no-account').send(payload);

		const dbOrder = await Order.findOne({ paymentIntentID: payload.paymentIntentID });
		expect(dbOrder).not.toBeNull();
	});

	it('does not set a userID on the order when the body does not include one', async () => {
		const payload = orderPayload();

		const res = await request(app).post('/orders/no-account').send(payload);

		expect(res.body.order.userID).toBeFalsy();

		const dbOrder = await Order.findOne({ paymentIntentID: payload.paymentIntentID });
		expect(dbOrder!.userID).toBeFalsy();
	});

	it('ignores a userID sent in the request body (cannot create an order tied to an account)', async () => {
		const userId = new mongoose.Types.ObjectId();

		const res = await request(app)
			.post('/orders/no-account')
			.send(orderPayload({ userID: userId.toString() }));

		expect(res.body.order.userID).toBeFalsy();
	});

	it('returns the existing order without creating a duplicate when paymentIntentID already exists', async () => {
		const payload = orderPayload();
		const existingOrder = await Order.create(payload);

		const res = await request(app).post('/orders/no-account').send(payload);

		expect(res.status).toBe(200);
		expect(res.body.error).toMatch(/ordered/i);
		expect(res.body.orderID).toBe(existingOrder._id.toString());

		const orderCount = await Order.countDocuments({ paymentIntentID: payload.paymentIntentID });
		expect(orderCount).toBe(1);
	});

	it('returns the existing order without creating a duplicate even when it belongs to a registered user', async () => {
		const payload = orderPayload();
		const existingOrder = await Order.create({ ...payload, userID: new mongoose.Types.ObjectId().toString() });

		const res = await request(app).post('/orders/no-account').send(payload);

		expect(res.status).toBe(200);
		expect(res.body.error).toMatch(/ordered/i);
		expect(res.body.orderID).toBe(existingOrder._id.toString());

		const orderCount = await Order.countDocuments({ paymentIntentID: payload.paymentIntentID });
		expect(orderCount).toBe(1);
	});

	it('returns a 500 via the global error handler when order validation fails', async () => {
		const payload: Record<string, unknown> = orderPayload();
		delete payload.paymentIntentID;

		const res = await request(app).post('/orders/no-account').send(payload);

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/internal server error/i);
	});
});

describe('GET /orders/user', () => {
	it('returns an empty array when the user has no orders yet', async () => {
		const { token } = await createUserWithCart([]);

		const res = await request(app).get('/orders/user').set('Authorization', `Bearer ${token}`);

		expect(res.body).toEqual([]);
	});

	it("returns the authenticated user's order", async () => {
		const { user, token } = await createUserWithCart([]);
		const payload = orderPayload();
		await Order.create({ ...payload, userID: user._id.toString() });

		const res = await request(app).get('/orders/user').set('Authorization', `Bearer ${token}`);

		expect(res.body).toEqual([expect.objectContaining({ paymentIntentID: payload.paymentIntentID })]);
	});

	it('returns multiple orders when the user has more than one', async () => {
		const { user, token } = await createUserWithCart([]);
		await Order.create({ ...orderPayload(), userID: user._id.toString() });
		await Order.create({ ...orderPayload(), userID: user._id.toString() });

		const res = await request(app).get('/orders/user').set('Authorization', `Bearer ${token}`);

		expect(res.body).toHaveLength(2);
	});

	it("does not return another user's orders", async () => {
		const { token } = await createUserWithCart([]);
		const { user: otherUser } = await createUserWithCart([]);
		await Order.create({ ...orderPayload(), userID: otherUser._id.toString() });

		const res = await request(app).get('/orders/user').set('Authorization', `Bearer ${token}`);

		expect(res.body).toEqual([]);
	});

	it('does not return guest orders (no userID)', async () => {
		const { token } = await createUserWithCart([]);
		await Order.create({ ...orderPayload(), userID: null });

		const res = await request(app).get('/orders/user').set('Authorization', `Bearer ${token}`);

		expect(res.body).toEqual([]);
	});

	it('returns a 500 error when the database lookup fails', async () => {
		const { token } = await createUserWithCart([]);
		vi.spyOn(Order, 'find').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).get('/orders/user').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/failed to fetch orders/i);
	});
});

describe('GET /orders/:orderID', () => {
	it('returns a 404 error when the order does not exist', async () => {
		const orderId = new mongoose.Types.ObjectId();

		const res = await request(app).get(`/orders/${orderId}`);

		expect(res.status).toBe(404);
		expect(res.body.error).toMatch(/not found/i);
	});

	it('returns a 500 error when the orderID is not a valid ObjectId', async () => {
		const res = await request(app).get('/orders/not-a-valid-object-id');

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/server error/i);
	});

	it('returns a guest order without requiring authentication', async () => {
		const order = await Order.create({ ...orderPayload(), userID: null });

		const res = await request(app).get(`/orders/${order._id}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ paymentIntentID: order.paymentIntentID }));
	});

	it('returns a guest order even when an Authorization header is provided', async () => {
		const order = await Order.create({ ...orderPayload(), userID: null });
		const token = signToken(new mongoose.Types.ObjectId());

		const res = await request(app).get(`/orders/${order._id}`).set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ paymentIntentID: order.paymentIntentID }));
	});

	it.only('returns a guest order even when the Authorization header contains an invalid token', async () => {
		const order = await Order.create({ ...orderPayload(), userID: null });
		const badToken = signToken(new mongoose.Types.ObjectId(), 'wrong-secret');

		const res = await request(app).get(`/orders/${order._id}`).set('Authorization', `Bearer ${badToken}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ paymentIntentID: order.paymentIntentID }));
	});

	it('returns a 401 error when the order has an owner and no Authorization header is sent', async () => {
		const { user } = await createUserWithCart([]);
		const order = await Order.create({ ...orderPayload(), userID: user._id.toString() });

		const res = await request(app).get(`/orders/${order._id}`);

		expect(res.status).toBe(401);
	});

	it('returns a 403 error when the order has an owner and the token is invalid', async () => {
		const { user } = await createUserWithCart([]);
		const order = await Order.create({ ...orderPayload(), userID: user._id.toString() });
		const badToken = signToken(user._id, 'wrong-secret');

		const res = await request(app).get(`/orders/${order._id}`).set('Authorization', `Bearer ${badToken}`);

		expect(res.status).toBe(403);
	});

	it('returns the order when the authenticated user is the owner', async () => {
		const { user, token } = await createUserWithCart([]);
		const order = await Order.create({ ...orderPayload(), userID: user._id.toString() });

		const res = await request(app).get(`/orders/${order._id}`).set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ paymentIntentID: order.paymentIntentID }));
	});

	it('returns a 403 error when the authenticated user is neither the owner nor an admin', async () => {
		const { user: owner } = await createUserWithCart([]);
		const { token } = await createUserWithCart([]);
		const order = await Order.create({ ...orderPayload(), userID: owner._id.toString() });

		const res = await request(app).get(`/orders/${order._id}`).set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(403);
		expect(res.body.error).toMatch(/access denied/i);
	});

	it('returns the order when the authenticated user is an admin', async () => {
		const { user: owner } = await createUserWithCart([]);
		const order = await Order.create({ ...orderPayload(), userID: owner._id.toString() });
		const adminToken = jwt.sign({ id: new mongoose.Types.ObjectId().toString(), isAdmin: true }, process.env.JWT_SEC as string);

		const res = await request(app).get(`/orders/${order._id}`).set('Authorization', `Bearer ${adminToken}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(expect.objectContaining({ paymentIntentID: order.paymentIntentID }));
	});
});
