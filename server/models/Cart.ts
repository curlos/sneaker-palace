import mongoose from 'mongoose';
import { applyRunValidators } from '../database/applyRunValidators';

const cartSchema = new mongoose.Schema(
	{
		userID: { type: String, required: true },
		products: [
			{
				productID: { type: String, required: true },
				size: { type: String, required: true },
				quantity: { type: Number, default: 1 },
				retailPrice: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true }
);

applyRunValidators(cartSchema);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
