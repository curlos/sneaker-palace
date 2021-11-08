export {}

const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    shoeID: {type: String, required: true },
    ratingNum: { type: Number, max: 5, required: true},
    size: {type: String},
    title: {type: String},
    text: {type: String},
    verifiedPurchase: {type: Boolean},
    helpful: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    unhelpful: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
  },
  { timestamps: true }
)

const Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating