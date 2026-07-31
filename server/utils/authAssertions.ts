import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Express } from 'express';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * For routes behind plain `verifyToken`. Auth runs before any body/param
 * handling, so these checks are all that's needed regardless of method.
 * `getApp` must be a getter (not the app itself) since `describe()` bodies
 * run before `beforeAll` has assigned `app`.
 */
// The exact response bodies verifyToken.ts sends on rejection. Checking these
// (not just the status code) proves a given 401/403 actually came from
// verifyToken itself, since a route's own logic can independently return
// 401/403 for unrelated reasons (e.g. an ownership check) with a different message.
const NOT_AUTHENTICATED_MESSAGE = 'You are not authenticated!';
const TOKEN_NOT_VALID_MESSAGE = 'Token is not valid!';

export function itRequiresAuth(getApp: () => Express, method: HttpMethod, path: string) {
	it('returns a 401 error when no Authorization header is sent', async () => {
		const res = await request(getApp())[method](path);

		expect(res.status).toBe(401);
		expect(res.body).toBe(NOT_AUTHENTICATED_MESSAGE);
	});

	it('returns a 403 error when the token is invalid', async () => {
		const badToken = jwt.sign({ id: 'someUserId', isAdmin: false }, 'wrong-secret');

		const res = await request(getApp())[method](path).set('Authorization', `Bearer ${badToken}`);

		expect(res.status).toBe(403);
		expect(res.body).toBe(TOKEN_NOT_VALID_MESSAGE);
	});

	// Proves a well-formed token actually gets past verifyToken - without this,
	// the two checks above would still pass even if verifyToken rejected every
	// request, valid or not.
	it('is not rejected by auth when a valid token is sent', async () => {
		const validToken = jwt.sign({ id: 'someUserId', isAdmin: false }, process.env.JWT_SEC as string);

		const res = await request(getApp())[method](path).set('Authorization', `Bearer ${validToken}`);

		expect(res.status).not.toBe(401);
		expect(res.status).not.toBe(403);
		expect(res.body).not.toBe(NOT_AUTHENTICATED_MESSAGE);
		expect(res.body).not.toBe(TOKEN_NOT_VALID_MESSAGE);
	});
}
