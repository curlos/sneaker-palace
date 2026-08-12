import mongoose from 'mongoose';
import { applyRunValidators } from '../database/applyRunValidators';

const orderSchema = new mongoose.Schema(
	{
		userID: { type: String },
		products: [
			{
				productID: { type: String },
				quantity: { type: Number, default: 1 },
				size: { type: String },
				retailPrice: { type: Number },
			},
		],
		amount: { type: Number, required: true },
		card: { type: Object, required: true },
		billingDetails: { type: Object, required: true },
		paymentIntentID: { type: String, required: true },
		orderDate: { type: String, required: true },
		deliveryDate: { type: String, required: true },
		status: { type: String, default: 'pending' },
	},
	{ timestamps: true }
);

applyRunValidators(orderSchema);

// Guards against a concurrent duplicate order submission (e.g. a double-click
// or network retry on Pay Now) creating two orders for the same payment -
// orderRouter.ts's pre-check (Order.findOne before creating) has a race
// window; this index is the actual atomic guarantee. Scoped to orders
// created from this fix's deploy date onward via partialFilterExpression,
// since older data already has duplicate paymentIntentIDs from before this
// protection existed and a plain unique index can't be built while
// duplicates exist - this leaves that historical data untouched rather than
// requiring a destructive cleanup.
orderSchema.index(
	{ paymentIntentID: 1 },
	{
		unique: true,
		partialFilterExpression: { createdAt: { $gte: new Date('2026-08-12T00:00:00.000Z') } },
	}
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
