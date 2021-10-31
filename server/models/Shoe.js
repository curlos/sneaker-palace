const mongoose = require('mongoose')

const shoeSchema = new mongoose.Schema(
  {
    shoeID: {type: String, required: true},
    sku: {type: String, required: true},
    brand: {type: String, required: true},
    name: {type: String, required: true},
    colorway: {type: String},
    gender: {type: String, required: true},
    silhouette: {type: String, required: true},
    releaseYear: {type: Number, required: true},
    releaseDate: {type: String},
    retailPrice: {type: Number, required: true},
    estimatedMarketValue: {type: Number, required: true},
    story: {type: String},
    image: {
      "360": {type: Array},
      original: {type: String, required: true},
      small: {type: String, required: true},
      thumbnail: {type: String, required: true},
    },
    links: {
      stockX: {type: String},
      goat: {type: String},
      flightClub: {type: String},
      stadiumGoods: {type: String},
    },
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
    rating: {type: Number},
    favorites: {type: Number},

  }
)

const Shoe = mongoose.model('Shoe', shoeSchema)

module.exports = Shoe;