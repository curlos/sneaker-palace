import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import Cart from '../models/Cart';
import Shoe from '../models/Shoe';
import { startTestServer, stopTestServer } from '../utils/testServer';
import { signToken } from '../utils/authAssertions';
import { buildShoe } from '../utils/shoeFixtures';

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
	await Shoe.deleteMany({});
});

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

describe('PUT /cart', () => {
	it('returns a 404 error when the user has no cart yet', async () => {
		const token = signToken(new mongoose.Types.ObjectId());

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: [] });

		expect(res.status).toBe(404);
	});

	it('updates the authenticated user\'s cart products', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userId.toString(), products: [] });
		await Shoe.create(buildShoe('shoe-3'));
		const token = signToken(userId);

		const newProducts = [{ productID: 'shoe-3', size: '11', quantity: 2, retailPrice: 150 }];

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: newProducts });

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual(newProducts.map((product) => expect.objectContaining(product)));

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect(dbCart!.products).toEqual(newProducts.map((product) => expect.objectContaining(product)));
	});

	it('does not alter another user\'s cart', async () => {
		const userA = new mongoose.Types.ObjectId();
		const userB = new mongoose.Types.ObjectId();

		const productA = { productID: 'shoe-a', size: '8', quantity: 1, retailPrice: 100 };
		await Cart.create({
			userID: userA.toString(),
			products: [productA],
		});
		await Cart.create({ userID: userB.toString(), products: [] });
		await Shoe.create(buildShoe('shoe-b'));

		const tokenB = signToken(userB);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${tokenB}`)
			.send({ products: [{ productID: 'shoe-b', size: '9', quantity: 1, retailPrice: 200 }] });

		expect(res.status).toBe(200);

		const dbCartA = await Cart.findOne({ userID: userA.toString() });
		expect(dbCartA!.products).toEqual([expect.objectContaining(productA)]);
	});

	it('ignores a userID sent in the request body (cannot reassign cart ownership)', async () => {
		const userA = new mongoose.Types.ObjectId();
		const userB = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userA.toString(), products: [] });
		const token = signToken(userA);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ userID: userB.toString(), products: [] });

		expect(res.status).toBe(200);
		expect(res.body.userID).toBe(userA.toString());

		const dbCart = await Cart.findOne({ userID: userA.toString() });
		expect(dbCart).not.toBeNull();

		const dbCartB = await Cart.findOne({ userID: userB.toString() });
		expect(dbCartB).toBeNull();
	});

	it('edits one product\'s size in place, leaving sibling products and their _id untouched', async () => {
		const userId = new mongoose.Types.ObjectId();
		const cart = await Cart.create({
			userID: userId.toString(),
			products: [
				{ productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 },
				{ productID: 'shoe-2', size: '10', quantity: 1, retailPrice: 200 },
			],
		});
		await Shoe.create([buildShoe('shoe-1'), buildShoe('shoe-2')]);
		const [productToEdit, otherProduct] = cart.products;
		const token = signToken(userId);

		const updatedProducts = cart.products.map((product) =>
			product._id!.toString() === productToEdit._id!.toString()
				? { ...product.toObject(), size: '11' }
				: product.toObject()
		);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: updatedProducts });

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual([
			expect.objectContaining({
				_id: productToEdit._id!.toString(),
				productID: 'shoe-1',
				size: '11',
			}),
			expect.objectContaining({
				_id: otherProduct._id!.toString(),
				productID: 'shoe-2',
				size: '10',
			}),
		]);
	});

	it('removes one product by _id from a multi-product cart, leaving the rest intact', async () => {
		const userId = new mongoose.Types.ObjectId();
		const cart = await Cart.create({
			userID: userId.toString(),
			products: [
				{ productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 },
				{ productID: 'shoe-2', size: '10', quantity: 1, retailPrice: 200 },
			],
		});
		await Shoe.create([buildShoe('shoe-1'), buildShoe('shoe-2')]);
		const [productToRemove, remainingProduct] = cart.products;
		const token = signToken(userId);

		const remainingProducts = cart.products
			.filter((product) => product._id!.toString() !== productToRemove._id!.toString())
			.map((product) => product.toObject());

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: remainingProducts });

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual([
			expect.objectContaining({ _id: remainingProduct._id!.toString(), productID: remainingProduct.productID }),
		]);
	});

	it('accepts a client-generated _id for a newly added product and echoes it back unchanged', async () => {
		const userId = new mongoose.Types.ObjectId();
		const cart = await Cart.create({
			userID: userId.toString(),
			products: [{ productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 }],
		});
		await Shoe.create([buildShoe('shoe-1'), buildShoe('shoe-new')]);
		const token = signToken(userId);

		const newProductId = new mongoose.Types.ObjectId().toString();
		const newProduct = { _id: newProductId, productID: 'shoe-new', size: '10', quantity: 1, retailPrice: 300 };
		const updatedProducts = [...cart.products.map((product) => product.toObject()), newProduct];

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: updatedProducts });

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual(expect.arrayContaining([expect.objectContaining(newProduct)]));

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect(dbCart!.products.some((product) => product._id!.toString() === newProductId)).toBe(true);
	});

	it('returns a 400 error and does not update the cart when a product references a shoe that does not exist', async () => {
		const userId = new mongoose.Types.ObjectId();
		const existingProduct = { productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 };
		await Cart.create({ userID: userId.toString(), products: [existingProduct] });
		await Shoe.create(buildShoe('shoe-1'));
		const token = signToken(userId);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({
				products: [
					existingProduct,
					{ productID: 'shoe-does-not-exist', size: '10', quantity: 1, retailPrice: 300 },
				],
			});

		expect(res.status).toBe(400);

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect(dbCart!.products).toEqual([expect.objectContaining(existingProduct)]);
	});

	it('returns a 400 error and does not update the cart when a product is missing a required field', async () => {
		const userId = new mongoose.Types.ObjectId();
		const existingProduct = { productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 };
		await Cart.create({ userID: userId.toString(), products: [existingProduct] });
		await Shoe.create(buildShoe('shoe-1'));
		const token = signToken(userId);

		// retailPrice is required on the Cart schema's product subdocument, but
		// findOneAndUpdate skips schema validators by default - runValidators
		// must be enabled (applyRunValidators) for this to actually be rejected.
		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: [{ productID: 'shoe-1', size: '9', quantity: 1 }] });

		expect(res.status).toBe(400);

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect(dbCart!.products).toEqual([expect.objectContaining(existingProduct)]);
	});

	it('returns a 400 error when a product has an invalid _id, instead of crashing', async () => {
		const userId = new mongoose.Types.ObjectId();
		const existingProduct = { productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 };
		await Cart.create({ userID: userId.toString(), products: [existingProduct] });
		await Shoe.create(buildShoe('shoe-1'));
		const token = signToken(userId);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({
				products: [{ _id: 'not-a-valid-object-id', productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 }],
			});

		expect(res.status).toBe(400);

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect(dbCart!.products).toEqual([expect.objectContaining(existingProduct)]);
	});

	it('returns a 400 error when products is not an array', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userId.toString(), products: [] });
		const token = signToken(userId);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: 'not-an-array' });

		expect(res.status).toBe(400);
	});

	it('leaves the cart unchanged when products is omitted from the body entirely', async () => {
		const userId = new mongoose.Types.ObjectId();
		const existingProduct = { productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 };
		await Cart.create({ userID: userId.toString(), products: [existingProduct] });
		const token = signToken(userId);

		const res = await request(app).put('/cart').set('Authorization', `Bearer ${token}`).send({});

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual([expect.objectContaining(existingProduct)]);
	});

	it('accepts multiple products referencing the same shoe (e.g. same shoe, different sizes)', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userId.toString(), products: [] });
		await Shoe.create(buildShoe('shoe-1'));
		const token = signToken(userId);

		const products = [
			{ productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 },
			{ productID: 'shoe-1', size: '10', quantity: 1, retailPrice: 100 },
		];

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products });

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual(products.map((product) => expect.objectContaining(product)));
	});

	it('strips unrecognized fields from a product before persisting it', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({ userID: userId.toString(), products: [] });
		await Shoe.create(buildShoe('shoe-1'));
		const token = signToken(userId);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({
				products: [
					{ productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100, someRandomField: 'should not persist' },
				],
			});

		expect(res.status).toBe(200);
		expect(res.body.products[0].someRandomField).toBeUndefined();

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect((dbCart!.products[0].toObject() as Record<string, unknown>).someRandomField).toBeUndefined();
	});

	it('clears a non-empty cart down to an empty products array', async () => {
		const userId = new mongoose.Types.ObjectId();
		await Cart.create({
			userID: userId.toString(),
			products: [{ productID: 'shoe-1', size: '9', quantity: 1, retailPrice: 100 }],
		});
		const token = signToken(userId);

		const res = await request(app)
			.put('/cart')
			.set('Authorization', `Bearer ${token}`)
			.send({ products: [] });

		expect(res.status).toBe(200);
		expect(res.body.products).toEqual([]);

		const dbCart = await Cart.findOne({ userID: userId.toString() });
		expect(dbCart!.products).toEqual([]);
	});
});
