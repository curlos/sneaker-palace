import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { startTestServer, stopTestServer } from '../utils/testServer';

const mockCreatePaymentIntent = vi.fn();

vi.mock('stripe', () => ({
	default: vi.fn().mockImplementation(function () {
		return { paymentIntents: { create: mockCreatePaymentIntent } };
	}),
}));

let mongod: MongoMemoryReplSet;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

beforeEach(() => {
	mockCreatePaymentIntent.mockClear();
});

describe('POST /checkout/create-payment-intent', () => {
	it('returns the client secret from Stripe when payment intent creation succeeds', async () => {
		mockCreatePaymentIntent.mockResolvedValueOnce({ client_secret: 'secret_abc123' });

		const res = await request(app).post('/checkout/create-payment-intent').send({ total: 100 });

		expect(res.status).toBe(200);
		expect(res.body.clientSecret).toBe('secret_abc123');
	});

	it('sends the amount to Stripe in cents', async () => {
		mockCreatePaymentIntent.mockResolvedValueOnce({ client_secret: 'secret_abc123' });

		await request(app).post('/checkout/create-payment-intent').send({ total: 150 });

		expect(mockCreatePaymentIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 15000 }));
	});

	it('returns a 500 error when Stripe fails to create the payment intent', async () => {
		mockCreatePaymentIntent.mockRejectedValueOnce(new Error('Stripe error'));

		const res = await request(app).post('/checkout/create-payment-intent').send({ total: 100 });

		expect(res.status).toBe(500);
		expect(res.body.error).toMatch(/payment intent/i);
	});

	it.each([
		['total is missing', undefined],
		['total is null', null],
		['total is not a number', 'abc'],
	])('returns a 400 error when %s', async (_description, total) => {
		const res = await request(app).post('/checkout/create-payment-intent').send({ total });

		expect(res.status).toBe(400);
		expect(mockCreatePaymentIntent).not.toHaveBeenCalled();
	});
});
