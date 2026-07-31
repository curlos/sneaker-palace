import express, { Request, Response } from 'express';
import Cart from '../models/Cart';
import { verifyToken } from './verifyToken';

const router = express.Router();

// Update cart
router.put('/', verifyToken, async (req: Request, res: Response) => {
	// Only allow updating products - prevents mass assignment (e.g. userID).
	const updatedCart = await Cart.findOneAndUpdate(
		{ userID: req.user!.id },
		{
			$set: { products: req.body.products },
		},
		{ returnDocument: 'after' }
	);

	if (!updatedCart) {
		return res.status(404).json({ error: 'Cart not found' });
	}

	return res.status(200).json(updatedCart);
});

// Get user's cart
router.get('/', verifyToken, async (req: Request, res: Response) => {
	const cart = await Cart.findOne({ userID: req.user!.id });
	return res.status(200).json(cart);
});

export default router;
