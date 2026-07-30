import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { isValidEmail } from '../utils/validation';
import User from '../models/User';
import Cart from '../models/Cart';

const router = express.Router();

// Register User
router.post('/register', async (req: Request, res: Response) => {
	// Basic validation
	if (typeof req.body.firstName !== 'string' || req.body.firstName.trim().length === 0) {
		return res.status(400).json({ error: 'First name is required' });
	}

	if (typeof req.body.lastName !== 'string' || req.body.lastName.trim().length === 0) {
		return res.status(400).json({ error: 'Last name is required' });
	}

	if (typeof req.body.password !== 'string' || req.body.password.trim().length === 0) {
		return res.status(400).json({ error: 'Password is required' });
	}

	if (req.body.password.length < 8) {
		return res.status(400).json({ error: 'Password must be at least 8 characters long' });
	}

	if (!req.body.email || !isValidEmail(req.body.email)) {
		return res.status(400).json({ error: 'A valid email is required' });
	}

	const foundUser = await User.findOne({ lowerCaseEmail: req.body.email.toLowerCase() });

	if (foundUser) {
		return res.status(400).json({ error: 'Email taken' });
	} else {
		const hashedPassword = await bcrypt.hash(req.body.password, 12);

		const session = await mongoose.startSession();

		try {
			let savedUser;

			// Build the document fresh on every attempt: withTransaction retries
			// this callback on transient errors, and reusing a document across
			// retries leaves its `isNew` flag set to false after the first
			// attempt, turning the retry's save() into a failing update.
			await session.withTransaction(async () => {
				const newUser = new User({
					email: req.body.email,
					password: hashedPassword,
					firstName: req.body.firstName,
					lastName: req.body.lastName,
					lowerCaseEmail: req.body.email,
				});

				savedUser = await newUser.save({ session });
				await Cart.create([{ userID: savedUser._id.toString(), products: [] }], { session });
			});

			const { password, ...others } = savedUser!.toObject();
			return res.status(201).json(others);
		} catch (err) {
			return res.status(500).json(err);
		} finally {
			session.endSession();
		}
	}
});

// Login User
router.post('/login', async (req: Request, res: Response) => {
	try {
		if (typeof req.body.email !== 'string' || req.body.email.trim().length === 0) {
			return res.status(400).json({ error: 'Email is required' });
		}

		if (typeof req.body.password !== 'string' || req.body.password.trim().length === 0) {
			return res.status(400).json({ error: 'Password is required' });
		}

		const user = await User.findOne({ lowerCaseEmail: req.body.email.toLowerCase() });

		if (!user) {
			return res.status(401).json('Wrong credentials');
		}

		// All passwords should be bcrypt after migration
		const isValidPassword = await bcrypt.compare(req.body.password, user.password);

		if (!isValidPassword) {
			return res.status(401).json('Wrong credentials');
		}

		const accessToken = jwt.sign(
			{
				id: user._id,
				isAdmin: user.isAdmin,
			},
			process.env.JWT_SEC as string,
			{ expiresIn: '3d' }
		);

		const { password, ...others } = user.toObject();

		return res.status(200).json({
			...others,
			accessToken,
		});
	} catch (err) {
		return res.status(500).json(err);
	}
});

export default router;
