import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { verifyToken } from './verifyToken';

const JWT_SEC = 'unit-test-secret';

beforeAll(() => {
	process.env.JWT_SEC = JWT_SEC;
});

function buildReq(authHeader?: string, params: Record<string, string> = {}): Request {
	return { headers: authHeader ? { authorization: authHeader } : {}, params } as unknown as Request;
}

function signToken(payload: object, secret = JWT_SEC) {
	return jwt.sign(payload, secret);
}

// Resolves once the middleware settles, whether synchronously (no header) or
// asynchronously (jwt.verify's callback), and whichever branch fires -
// the error response or the success `next()`.
function runMiddleware(
	middleware: (req: Request, res: Response, next: NextFunction) => void,
	req: Request
): Promise<{ res: Response; nextCalled: boolean }> {
	return new Promise((resolve) => {
		let nextCalled = false;
		const res: Partial<Response> = {};
		res.status = vi.fn().mockReturnValue(res);
		res.json = vi.fn(() => {
			resolve({ res: res as Response, nextCalled });
			return res as Response;
		});

		const next = vi.fn(() => {
			nextCalled = true;
			resolve({ res: res as Response, nextCalled });
		}) as unknown as NextFunction;

		middleware(req, res as Response, next);
	});
}

describe('verifyToken', () => {
	it('returns 401 when no Authorization header is present', async () => {
		const { res, nextCalled } = await runMiddleware(verifyToken, buildReq());

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith('You are not authenticated!');
		expect(nextCalled).toBe(false);
	});

	it('returns 403 when the token signature is invalid', async () => {
		const badToken = signToken({ id: 'u1', isAdmin: false }, 'wrong-secret');
		const { res, nextCalled } = await runMiddleware(verifyToken, buildReq(`Bearer ${badToken}`));

		expect(res.status).toHaveBeenCalledWith(403);
		expect(res.json).toHaveBeenCalledWith('Token is not valid!');
		expect(nextCalled).toBe(false);
	});

	it('returns 403 for an expired token', async () => {
		vi.spyOn(jwt, 'verify').mockImplementationOnce(((..._args: unknown[]) => {
			const cb = _args[2] as (err: jwt.VerifyErrors | null) => void;
			cb(new jwt.TokenExpiredError('jwt expired', new Date()));
		}) as typeof jwt.verify);

		const { res, nextCalled } = await runMiddleware(verifyToken, buildReq('Bearer irrelevant-token'));

		expect(res.status).toHaveBeenCalledWith(403);
		expect(nextCalled).toBe(false);
	});

	it('sets req.user and calls next() for a valid token', async () => {
		const token = signToken({ id: 'u1', isAdmin: true }, JWT_SEC);
		const req = buildReq(`Bearer ${token}`);
		const { nextCalled } = await runMiddleware(verifyToken, req);

		expect(nextCalled).toBe(true);
		expect(req.user!.id).toBe('u1');
		expect(req.user!.isAdmin).toBe(true);
	});
});
