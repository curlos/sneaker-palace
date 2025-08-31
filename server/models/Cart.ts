export {};

const mongoose = require('mongoose');

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

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
