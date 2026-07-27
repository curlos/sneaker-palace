import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;
let app: any;

beforeAll(async () => {
	mongod = await MongoMemoryServer.create();

	// Point the app at the in-memory Mongo instance and skip app.listen()
	// before importing server.ts, since both are read at import time.
	process.env.ATLAS_URI = mongod.getUri();
	process.env.VERCEL = '1';
	process.env.JWT_SEC = process.env.JWT_SEC || 'test-secret';

	const serverModule = await import('../server');
	app = serverModule.default;

	await new Promise<void>((resolve) => {
		if (mongoose.connection.readyState === 1) return resolve();
		mongoose.connection.once('open', () => resolve());
	});
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongod.stop();
});

describe('POST /auth/register', () => {
	it('creates a new user with valid data', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(201);
		expect(res.body.email).toBe('test@example.com');
	});

	it('rejects a password shorter than 8 characters', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test2@example.com',
			password: 'short',
		});

		expect(res.status).toBe(400);
	});

	it('rejects a duplicate email', async () => {
		const res = await request(app).post('/auth/register').send({
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			password: 'password123',
		});

		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Email taken');
	});
});
