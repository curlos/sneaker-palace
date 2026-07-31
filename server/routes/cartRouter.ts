import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import Shoe from '../models/Shoe';
import { verifyToken } from './verifyToken';

const router = express.Router();

// Update cart
router.put('/', verifyToken, async (req: Request, res: Response) => {
	const products = req.body.products;

	if (products !== undefined && !Array.isArray(products)) {
		return res.status(400).json({ error: 'products must be an array' });
	}

	if (Array.isArray(products) && products.length > 0) {
		const hasInvalidId = products.some(
			(product: { _id?: string }) => product._id !== undefined && !mongoose.Types.ObjectId.isValid(product._id)
		);

		if (hasInvalidId) {
			return res.status(400).json({ error: 'One or more products have an invalid _id' });
		}

		// Every product must reference a shoe that actually exists - otherwise a
		// cart could point at data that was never real (or was since deleted).
		const productIDs = [...new Set(products.map((product: { productID: string }) => product.productID))];
		const existingShoeCount = await Shoe.countDocuments({ shoeID: { $in: productIDs } });

		if (existingShoeCount !== productIDs.length) {
			return res.status(400).json({ error: 'One or more products reference a shoe that does not exist' });
		}
	}

	try {
		// Only allow updating products - prevents mass assignment (e.g. userID).
		const updatedCart = await Cart.findOneAndUpdate(
			{ userID: req.user!.id },
			{
				$set: { products },
			},
			{ returnDocument: 'after' }
		);

		if (!updatedCart) {
			return res.status(404).json({ error: 'Cart not found' });
		}

		return res.status(200).json(updatedCart);
	} catch (err) {
		if (err instanceof mongoose.Error.ValidationError) {
			return res.status(400).json({ error: err.message });
		}
		throw err;
	}
});

// Get user's cart
router.get('/', verifyToken, async (req: Request, res: Response) => {
	const cart = await Cart.findOne({ userID: req.user!.id });
	return res.status(200).json(cart);
});

export default router;
