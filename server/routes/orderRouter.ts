import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Cart from '../models/Cart';
import Order from '../models/Order';
import { verifyToken } from './verifyToken';

const router = express.Router();

const verifyOrderAccess = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const order = await Order.findById(req.params.orderID);

		if (!order) {
			return res.status(404).json({ error: 'Order not found' });
		}

		// If no userID field exists, it's a guest order - allow access
		if (!order.userID) {
			req.order = order;
			return next();
		}

		// If userID exists, verify token first
		verifyToken(req, res, () => {
			// Check if user owns the order or is admin
			if (order.userID !== req.user!.id && !req.user!.isAdmin) {
				return res.status(403).json({ error: 'Access denied' });
			}

			req.order = order;
			next();
		});
	} catch {
		return res.status(500).json({ error: 'Server error' });
	}
};

router.get('/user', verifyToken, async (req: Request, res: Response) => {
	try {
		const orders = await Order.find({ userID: req.user!.id });
		return res.json(orders);
	} catch (error) {
		console.error('Error fetching user orders:', error);
		return res.status(500).json({ error: 'Failed to fetch orders' });
	}
});

router.get('/:orderID', verifyOrderAccess, async (req: Request, res: Response) => {
	return res.json(req.order);
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
		return res.status(500).json({ error: 'Failed to place order' });
	} finally {
		session.endSession();
	}

	const updatedUser = await User.findById(req.user!.id);
	const updatedCart = await Cart.findOne({ userID: req.user!.id });

	if (!updatedUser) {
		return res.status(404).json({ error: 'User not found' });
	}

	const { password, ...userWithoutPassword } = updatedUser.toObject();

	return res.json({ order, updatedUser: userWithoutPassword, updatedCart });
});

router.post('/no-account', async (req: Request, res: Response) => {
	const orderFound = await Order.findOne({ paymentIntentID: req.body.paymentIntentID });

	if (orderFound) {
		return res.json({ error: 'Already ordered', orderID: orderFound._id });
	}

	const order = new Order({
		...req.body,
	});

	await order.save();

	return res.json({ order });
});

export default router;
