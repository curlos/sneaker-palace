import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Cart from '../models/Cart';
import Order from '../models/Order';
import { verifyToken } from '../utils/verifyToken';

const router = express.Router();

router.get('/user', verifyToken, async (req: Request, res: Response) => {
	try {
		const orders = await Order.find({ userID: req.user!.id });
		return res.json(orders);
	} catch (error) {
		console.error('Error fetching user orders:', error);
		return res.status(500).json({ error: 'Failed to fetch orders' });
	}
});

router.get('/:orderID', async (req: Request, res: Response) => {
	try {
		const order = await Order.findById(req.params.orderID);

		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}

		// If no userID field exists, it's a guest order - allow access
		if (!order.userID) {
			return res.json(order);
		}

		// If userID exists, verify token first
		verifyToken(req, res, () => {
			// Check if user owns the order or is admin
			if (order.userID !== req.user!.id && !req.user!.isAdmin) {
				return res.status(403).json({ error: 'Access denied' });
			}

			return res.json(order);
		});
	} catch {
		return res.status(500).json({ error: 'Server error' });
	}
});

router.post('/', verifyToken, async (req: Request, res: Response) => {
	const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID });

	if (orderFound) {
		return res.json({ error: 'Already ordered', orderID: orderFound._id });
	}

	const user = await User.findById(req.user!.id);
	const cart = await Cart.findOne({ userID: req.user!.id });

	if (!user || !cart) {
		return res.status(404).json({ error: 'User or cart not found' });
	}

	cart.products.splice(0, cart.products.length);

	const order = new Order({
		...req.body,
		userID: req.user!.id,
	});

	const session = await mongoose.startSession();

	try {
		session.startTransaction();

		await user.updateOne({ $push: { orders: order } }, { session });
		await cart.save({ session });
		await order.save({ session });

		await session.commitTransaction();
	} catch {
		await session.abortTransaction();

		// The findOne check above has a race window - two concurrent requests
		// for the same paymentIntentID can both pass it before either commits.
		// The unique index on Order is the real (atomic) guard against that; if
		// this failure was caused by it, another request already created the
		// order, so report it the same way the pre-check above does instead of
		// a hard failure.
		const existingOrder = await Order.findOne({ paymentIntentID: req.body.paymentIntentID });
		if (existingOrder) {
			return res.json({ error: 'Already ordered', orderID: existingOrder._id });
		}

		return res.status(500).json({ error: 'Failed to place order' });
	} finally {
		session.endSession();
	}

	const updatedUser = await User.findById(req.user!.id);
	const updatedCart = await Cart.findOne({ userID: req.user!.id });

	if (!updatedUser) {
		return res.status(404).json({ error: 'User not found' });
	}

	return res.json({ order, updatedUser, updatedCart });
});

router.post('/no-account', async (req: Request, res: Response) => {
	const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID });

	if (orderFound) {
		return res.json({ error: 'Already ordered', orderID: orderFound._id });
	}

	const order = new Order({
		...req.body,
		userID: null,
	});

	try {
		await order.save();
	} catch {
		// The findOne check above has a race window - two concurrent requests
		// for the same paymentIntentID can both pass it before either saves.
		// The unique index on Order is the real (atomic) guard against that; if
		// this failure was caused by it, another request already created the
		// order, so report it the same way the pre-check above does instead of
		// a hard failure.
		const existingOrder = await Order.findOne({ paymentIntentID: req.body.paymentIntentID });
		if (existingOrder) {
			return res.json({ error: 'Already ordered', orderID: existingOrder._id });
		}

		return res.status(500).json({ error: 'Failed to create order' });
	}

	return res.json({ order });
});

export default router;
