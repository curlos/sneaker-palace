import mongoose from 'mongoose';
import { applyRunValidators } from '../database/applyRunValidators';

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		isAdmin: { type: Boolean, default: false },
		profilePic: { type: String },
		preselectedShoeSize: { type: String },
		preferredGender: { type: String },
		unitOfMeasure: { type: String },
		ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
		favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shoe' }],
		orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
		lowerCaseEmail: { type: String, lowercase: true, trim: true, required: true },
		helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
		notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
	},
	{ timestamps: true }
);

applyRunValidators(userSchema);

// res.json() serializes Mongoose documents via toJSON() - stripping password
// here means routes no longer need to destructure it out individually before
// responding. Direct property access (e.g. bcrypt.compare(pw, user.password))
// is unaffected since it doesn't go through toJSON(). Kept as a separate
// .set() call (not inline with timestamps above) since passing it inline to
// the Schema constructor confuses TS's field-type inference - `password`
// (and other fields) end up typed `unknown` everywhere the model is used.
userSchema.set('toJSON', {
	transform: (_doc, ret) => {
		Reflect.deleteProperty(ret, 'password');
		return ret;
	},
});

const User = mongoose.model('User', userSchema);

export default User;
