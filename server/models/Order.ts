export {}

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    products: [
      {
        productID: { type: String },
        quantity: { type: Number, default: 1}
      },
    ],
    amount: { type: Number, required: true},
    card: {type: Object, required: true},
    billingDetails: { type: Object, required: true},
    paymentIntentID: { type: String, required: true},
    orderDate: { type: String, required: true},
    deliveryDate: {type: String, required: true},
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
)

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
