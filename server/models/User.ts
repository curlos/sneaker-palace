export {}

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isAdmin: { type: Boolean, default: false},
    profilePic: { type: String }, 
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    shoeFavorites: [{ type: String, required: true }],
    reviewUpvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    reviewDownvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    shoppingCartItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shoe' }],
    itemsBought: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shoe' }],
    lowerCaseEmail: {type: String, lowercase: true, trim: true, required: true },
  },
  { timestamps: true}
)

const User = mongoose.model('User', userSchema)

module.exports = User;