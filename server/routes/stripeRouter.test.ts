import request from 'supertest';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { startTestServer, stopTestServer } from '../utils/testServer';

const mockCreatePaymentIntent = vi.fn();
const mockRetrievePaymentMethod = vi.fn();

vi.mock('stripe', () => ({
	default: vi.fn().mockImplementation(function () {
		return {
			paymentIntents: { create: mockCreatePaymentIntent },
			paymentMethods: { retrieve: mockRetrievePaymentMethod },
		};
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
	mockRetrievePaymentMethod.mockClear();
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

describe('GET /checkout/payment-method/:paymentMethodID', () => {
	it('returns the payment method from Stripe, including card and billing details', async () => {
		mockRetrievePaymentMethod.mockResolvedValueOnce({
			id: 'pm_test_123',
			card: { brand: 'visa' },
			billing_details: { name: 'Test User', email: 'test@example.com' },
		});

		const res = await request(app).get('/checkout/payment-method/pm_test_123');

		expect(res.status).toBe(200);
		expect(res.body).toEqual(
			expect.objectContaining({
				id: 'pm_test_123',
				card: { brand: 'visa' },
				billing_details: { name: 'Test User', email: 'test@example.com' },
			})
		);
	});

	it('passes the paymentMethodID route param to Stripe', async () => {
		mockRetrievePaymentMethod.mockResolvedValueOnce({ id: 'pm_test_123' });

		await request(app).get('/checkout/payment-method/pm_test_123');

		expect(mockRetrievePaymentMethod).toHaveBeenCalledWith('pm_test_123');
	});

	it('returns a 500 error when Stripe fails to retrieve the payment method', async () => {
		mockRetrievePaymentMethod.mockRejectedValueOnce(new Error('Stripe error'));

		const res = await request(app).get('/checkout/payment-method/pm_test_123');

		expect(res.status).toBe(500);
		expect(res.body.error).toBe('Internal server error');
	});
});
