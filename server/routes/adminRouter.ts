import { Request, Response } from 'express';

const router = require('express').Router();
const User = require('../models/User');
const Shoe = require('../models/Shoe');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const { addAllShoes, addAllShoesByBrand, addShoeByName } = require('../utils/sneakerV2_API');

// Simple admin authentication middleware
const adminAuth = (req: Request, res: Response, next: any) => {
	const adminSecret = req.headers['admin-secret'];

	// Use a temporary secret for this migration
	if (adminSecret !== process.env.ADMIN_MIGRATION_SECRET) {
		return res.status(403).json({ error: 'Admin access required' });
	}

	next();
};

// Shoe management endpoints - Admin only (Development environment only)
if (process.env.NODE_ENV !== 'production') {
	// Password migration endpoint
	// NOTE: PASS_SEC must be temporarily added back to .env before running this migration
	router.post('/migrate-passwords', adminAuth, async (_req: Request, res: Response) => {
		try {
			const users = await User.find({});
			let migratedCount = 0;
			let errorCount = 0;
			let alreadyMigratedCount = 0;
			const errors: string[] = [];

			for (const user of users) {
				try {
					// Check if password is already bcrypt (starts with $2a$, $2b$, $2x$, or $2y$)
					if (/^\$2[abxy]\$/.test(user.password)) {
						alreadyMigratedCount++;
						continue;
					}

					// Legacy password - decrypt and upgrade
					const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
					const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

					if (!originalPassword) {
						errors.push(`Failed to decrypt password for user ${user._id}`);
						errorCount++;
						continue;
					}

					// Hash with bcrypt
					const newPasswordHash = await bcrypt.hash(originalPassword, 12);

					// Update user in database
					await User.findByIdAndUpdate(user._id, {
						$set: { password: newPasswordHash },
					});

					migratedCount++;
				} catch (error) {
					errors.push(`Error migrating user ${user._id}: ${error}`);
					errorCount++;
				}
			}

			return res.status(200).json({
				message: 'Password migration completed',
				statistics: {
					totalUsers: users.length,
					migratedCount,
					alreadyMigratedCount,
					errorCount,
					errors,
				},
			});
		} catch (error) {
			return res.status(500).json({
				error: 'Migration failed',
				details: error,
			});
		}
	});

	router.post('/shoes/newShoes', adminAuth, async (req: Request, res: Response) => {
		const result = await addAllShoes(Number(req.body.page), req.body.name);
		return res.json({ data: result });
	});

	router.post('/shoes/newShoes/brand', adminAuth, async (req: Request, res: Response) => {
		const result = await addAllShoesByBrand(req.body.brand, Number(req.body.page), Number(req.body.releaseYear));
		return res.json(result);
	});

	router.post('/shoes/newShoe', adminAuth, async (req: Request, res: Response) => {
		const result = await addShoeByName(req.body.name);
		return res.json({ data: result });
	});

	router.post('/shoes/delete', adminAuth, async (req: Request, res: Response) => {
		const result = await Shoe.deleteMany({ brand: { $in: ['Louis Vuitton'] } });
		return res.json(result);
	});

	router.get('/shoes/grouped-by-brand', async (req: Request, res: Response) => {
		try {
			const { releaseYear, brand } = req.query;
			
			const filter: any = {};
			
			if (releaseYear) {
				filter.releaseYear = Number(releaseYear);
			}
			
			if (brand) {
				filter.brand = { $regex: new RegExp(`^${brand}$`, 'i') };
			}
			
			const shoes = await Shoe.find(filter, 'brand name releaseYear releaseDate').lean();
			
			const groupedShoes = shoes.reduce((acc: any, shoe: any) => {
				const { brand, name, releaseYear, releaseDate } = shoe;
				const yearOrDate = releaseYear ? releaseYear : (releaseDate ? releaseDate : '');
				const formattedString = `${brand} - ${name} (${yearOrDate})`;
				
				if (!acc[brand]) {
					acc[brand] = [];
				}
				acc[brand].push(formattedString);
				
				return acc;
			}, {});
			
			return res.json(groupedShoes);
		} catch (error) {
			return res.status(500).json({ error: 'Error fetching grouped shoes' });
		}
	});
}

module.exports = router;
