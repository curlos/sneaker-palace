import request from 'supertest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import { startTestServer, stopTestServer } from '../test/testServer';

let mongod: MongoMemoryServer;
let app: Awaited<ReturnType<typeof startTestServer>>['app'];

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

	it('rejects a duplicate email that differs only by casing', async () => {
		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'Test-Duplicate-Casing@Example.com',
			password: 'password123',
		});

		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test-duplicate-casing@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/taken/i);

		const count = await User.countDocuments({ lowerCaseEmail: 'test-duplicate-casing@example.com' });
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

		expect(savedUser).not.toBeNull();
		expect(savedUser!.password).not.toBe(plainPassword);
		expect(await bcrypt.compare(plainPassword, savedUser!.password)).toBe(true);
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

describe('POST /auth/login', () => {
	it('rejects a missing email', async () => {
		const res = await request(app).post('/auth/login').send({
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/email/i);
	});

	it('rejects an email that is only whitespace', async () => {
		const res = await request(app).post('/auth/login').send({
			email: '   ',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/email/i);
	});

	it('rejects a missing password', async () => {
		const res = await request(app).post('/auth/login').send({
			email: 'test-login-missing-password@example.com',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/password/i);
	});

	it('rejects a password that is only whitespace', async () => {
		const res = await request(app).post('/auth/login').send({
			email: 'test-login-whitespace-password@example.com',
			password: '        ',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/password/i);
	});

	it('rejects an email with no matching user', async () => {
		const res = await request(app).post('/auth/login').send({
			email: 'test-login-no-such-user@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(401);
		expect(res.body).toMatch(/wrong credentials/i);
	});

	it('rejects an incorrect password for an existing user', async () => {
		const email = 'test-login-wrong-password@example.com';

		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email,
			password: 'correctPassword123',
		});

		const res = await request(app).post('/auth/login').send({
			email,
			password: 'wrongPassword123',
		});

		expect(res.status).toBe(401);
		expect(res.body).toMatch(/wrong credentials/i);
	});

	it('logs in successfully with correct credentials', async () => {
		const email = 'test-login-success@example.com';
		const password = 'password123';

		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email,
			password,
		});

		const res = await request(app).post('/auth/login').send({ email, password });

		expect(res.status).toBe(200);
		expect(res.body._id).toBeDefined();
		expect(res.body.email).toBe(email);
		expect(res.body.firstName).toBe('Test');
		expect(res.body.lastName).toBe('User');
		expect(res.body.password).toBeUndefined();
		expect(res.body.accessToken).toBeDefined();
	});

	it('returns an accessToken that is a valid JWT for the logged-in user', async () => {
		const email = 'test-login-jwt@example.com';
		const password = 'password123';

		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email,
			password,
		});

		const res = await request(app).post('/auth/login').send({ email, password });

		const decoded = jwt.verify(res.body.accessToken, process.env.JWT_SEC as string) as jwt.JwtPayload;

		expect(decoded.id).toBe(res.body._id);
		expect(decoded.isAdmin).toBe(false);
	});

	it('returns 500 if the database lookup fails', async () => {
		vi.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('DB error'));

		const res = await request(app).post('/auth/login').send({
			email: 'test-login-db-failure@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(500);
	});

	it('logs in successfully regardless of email casing', async () => {
		const password = 'password123';

		await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'Test-Login-Casing@Example.com',
			password,
		});

		const res = await request(app).post('/auth/login').send({
			email: 'test-login-casing@example.com',
			password,
		});

		expect(res.status).toBe(200);
		expect(res.body.accessToken).toBeDefined();
	});

	it('rejects a non-string email (injection-style payload)', async () => {
		const res = await request(app)
			.post('/auth/login')
			.send({ email: { $ne: null }, password: 'password123' });
		
		expect(res.status).toBe(400);
		expect(res.body.error).toMatch(/email/i);
	});

	it('rejects a legacy (pre-bcrypt) password with wrong credentials instead of crashing', async () => {
		const email = 'test-login-legacy-password@example.com';
		const plainPassword = 'password123';

		const user = new User({
			email,
			lowerCaseEmail: email,
			firstName: 'Test',
			lastName: 'User',
			// Simulates a pre-migration password, e.g. CryptoJS AES output, not a bcrypt hash.
			password: 'U2FsdGVkX1/unCvCk6avc3iM5o3TNomz8qy4jguxgx0=',
		});
		await user.save();

		const res = await request(app).post('/auth/login').send({
			email,
			password: plainPassword,
		});

		expect(res.status).toBe(401);
		expect(res.body).toMatch(/wrong credentials/i);
	});
});
