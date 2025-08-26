export {}

const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema(
  {
    shoeID: { type: String, required: true },
    size: { type: String, required: true},
    quantity: { type: Number, default: 1}
  },
  { timestamps: true }
)

const CartItem = mongoose.model('Cart', cartItemSchema)

module.exports = CartItem