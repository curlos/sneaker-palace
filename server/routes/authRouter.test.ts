import request from 'supertest';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import { startTestServer, stopTestServer } from '../test/testServer';

let mongod: MongoMemoryServer;
let app: any;

beforeAll(async () => {
	({ app, mongod } = await startTestServer());
});

afterAll(async () => {
	await stopTestServer(mongod);
});

describe('POST /auth/register', () => {
	it('rejects a missing firstName', async () => {
		const res = await request(app).post('/auth/register').send({
			lastName: 'User',
			email: 'test-missing-firstname@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/first name/i);
	});

	it('rejects a firstName that is only whitespace', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: '   ',
			lastName: 'User',
			email: 'test-whitespace-firstname@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/first name/i);
	});

	it('rejects a missing lastName', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			email: 'test-missing-lastname@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/last name/i);
	});

	it('rejects a lastName that is only whitespace', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: '   ',
			email: 'test-whitespace-lastname@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/last name/i);
	});

	it('rejects a missing password', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test-missing-password@example.com',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/password/i);
	});

	it('rejects a password that is only whitespace', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test-whitespace-password@example.com',
			password: '        ',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/password/i);
	});

	it('rejects a 7-character password (just below the 8-character minimum)', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test2@example.com',
			password: 'pass123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/8 characters/i);
	});

	it('accepts an 8-character password (the minimum allowed)', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test-min-password@example.com',
			password: 'pass1234',
		});

		expect(res.status).toBe(201);
	});

	it('rejects a missing email', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/email/i);
	});

	it('rejects invalid email formats', async () => {
		const invalidEmails = ['carlos', 'carlos@', 'carlosexample.com', 'carlos@example', '   '];

		for (const email of invalidEmails) {
			const res = await request(app).post('/auth/register').send({
				firstName: 'Test',
				lastName: 'User',
				email,
				password: 'password123',
			});

			expect(res.status).toBe(400);
			expect(res.body.error).toMatch(/email/i);
		}
	});

	it('rejects a duplicate email', async () => {
		const email = 'test-duplicate@example.com';

		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email,
			password: 'password123',
		});

		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email,
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/taken/i);

		const count = await User.countDocuments({ email });
		expect(count).toBe(1);
	});

	it('creates a new user with valid data', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(201);
		expect(res.body._id).toBeDefined();
		expect(res.body.email).toBe('test@example.com');
		expect(res.body.firstName).toBe('Test');
		expect(res.body.lastName).toBe('User');
		expect(res.body.password).toBeUndefined();
	});

	it('ignores unexpected fields like isAdmin (protects against mass assignment)', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test-mass-assignment@example.com',
			password: 'password123',
			isAdmin: true,
		});

		expect(res.status).toBe(201);
		expect(res.body.isAdmin).toBe(false);
	});

	it('stores the password as a bcrypt hash, not plain text', async () => {
		const plainPassword = 'password123';
		const email = 'test-hash-check@example.com';

		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email,
			password: plainPassword,
		});

		const savedUser = await User.findOne({ email });

		expect(savedUser?.password).not.toBe(plainPassword);
		expect(await bcrypt.compare(plainPassword, savedUser?.password)).toBe(true);
	});

	it('returns 500 if the database save fails', async () => {
		vi.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test-db-failure@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(500);
	});
});
