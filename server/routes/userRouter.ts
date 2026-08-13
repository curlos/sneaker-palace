import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserType } from '../types/types';
import { isValidEmail } from '../utils/validation';
import User from '../models/User';
import { verifyToken } from '../utils/verifyToken';

const router = express.Router();

router.get(
	'/:userID',
	(req: Request, _res: Response, next: NextFunction) => {
		const authHeader = req.headers.authorization;

		if (authHeader) {
			const token = authHeader.split(' ')[1];
			jwt.verify(
				token,
				process.env.JWT_SEC as string,
				(err: jwt.VerifyErrors | null, decoded: jwt.JwtPayload | string | undefined) => {
					if (!err) {
						req.user = decoded as UserType;
					}
					next();
				}
			);
		} else {
			next();
		}
	},
	async (req: Request, res: Response) => {
		const user = await User.findById(req.params.userID);

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		const isOwnProfile = req.user && req.user.id === req.params.userID;

		if (isOwnProfile) {
			return res.json(user);
		} else {
			const { password, email, lowerCaseEmail, isAdmin, orders, ...publicProfile } = user.toObject();
			return res.json(publicProfile);
		}
	}
);

// Fields the frontend actually sends from AccountDetails.tsx and ShopPreferences.tsx.
const ALLOWED_UPDATE_FIELDS = [
	'firstName',
	'lastName',
	'email',
	'profilePic',
	'preselectedShoeSize',
	'preferredGender',
	'unitOfMeasure',
] as const;

router.put('/', verifyToken, async (req: Request, res: Response) => {
	const currentUser = await User.findById(req.user!.id);

	if (!currentUser) {
		return res.status(404).json({ error: 'User not found' });
	}

	// Only allow whitelisted fields through - prevents mass assignment (e.g. isAdmin).
	const updateData: Partial<Record<(typeof ALLOWED_UPDATE_FIELDS)[number] | 'lowerCaseEmail', string>> = {};
	for (const field of ALLOWED_UPDATE_FIELDS) {
		if (req.body[field] !== undefined) {
			updateData[field] = req.body[field];
		}
	}

	// firstName/lastName can't be blank - the other fields are either kept
	// non-blank by the FE or covered by their own validators.
	if (updateData.firstName !== undefined && updateData.firstName.trim() === '') {
		return res.status(400).json({ error: 'First name cannot be blank' });
	}

	if (updateData.lastName !== undefined && updateData.lastName.trim() === '') {
		return res.status(400).json({ error: 'Last name cannot be blank' });
	}

	// If email is being updated, check if it's different and unique (case-insensitively)
	if (updateData.email) {
		if (!isValidEmail(updateData.email)) {
			return res.status(400).json({ error: 'A valid email is required' });
		}

		const newLowerCaseEmail = updateData.email.toLowerCase();

		// Check if the new email is different from current email
		if (newLowerCaseEmail !== currentUser.lowerCaseEmail) {
			// Check if the new email already exists in the database
			const existingUser = await User.findOne({ lowerCaseEmail: newLowerCaseEmail });

			if (existingUser) {
				return res.status(400).json({ error: 'Email already exists' });
			}

			updateData.lowerCaseEmail = newLowerCaseEmail;
		}
	}

	const updatedUser = await User.findByIdAndUpdate(
		req.user!.id,
		{
			$set: updateData,
		},
		{ returnDocument: 'after' }
	);

	if (!updatedUser) {
		return res.status(404).json({ error: 'User not found' });
	}

	return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
});

router.put('/password', verifyToken, async (req: Request, res: Response) => {
	try {
		// Basic validation
		if (!req.body.currentPassword || !req.body.newPassword) {
			return res.status(400).json({ error: 'Current password and new password are required' });
		}

		if (req.body.newPassword.trim().length < 8) {
			return res.status(400).json({ error: 'New password must be at least 8 characters long' });
		}

		const user = await User.findOne({ _id: req.user!.id });

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Verify current password using bcrypt (all passwords should be bcrypt after auto-upgrade)
		const isValidCurrentPassword = await bcrypt.compare(req.body.currentPassword, user.password);

		if (!isValidCurrentPassword) {
			return res.status(400).json({ error: 'Current password is incorrect' });
		}

		// Hash new password with bcrypt
		const newPasswordHash = await bcrypt.hash(req.body.newPassword, 12);
		const newPassword = {
			password: newPasswordHash,
		};

		const updatedUser = await User.findByIdAndUpdate(
			req.user!.id,
			{
				$set: newPassword,
			},
			{ returnDocument: 'after' }
		);

		if (!updatedUser) {
			return res.status(404).json({ error: 'User not found' });
		}

		return res.status(200).json({ message: 'Password updated successfully', user: updatedUser });
	} catch {
		return res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
