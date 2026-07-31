import mongoose from 'mongoose';
import { applyRunValidators } from '../database/applyRunValidators';

const ratingSchema = new mongoose.Schema(
	{
		userID: { type: String, required: true },
		shoeID: { type: String, required: true },
		ratingNum: { type: Number, max: 5, required: true },
		summary: { type: String },
		text: { type: String },
		photo: { type: String },
		size: { type: String },
		comfort: { type: String },
		width: { type: String },
		quality: { type: String },
		recommended: { type: Boolean },
		verifiedPurchase: { type: Boolean },
		helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true }
);

applyRunValidators(ratingSchema);

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
