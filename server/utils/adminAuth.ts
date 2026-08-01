import { NextFunction, Request, Response } from 'express';

// Shared admin-only guard - requires the `admin-secret` header to match
// ADMIN_MIGRATION_SECRET. Used on dev-only admin/migration routes.
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
	const adminSecret = req.headers['admin-secret'];

	if (adminSecret !== process.env.ADMIN_MIGRATION_SECRET) {
		return res.status(403).json({ error: 'Admin access required' });
	}

	next();
};
