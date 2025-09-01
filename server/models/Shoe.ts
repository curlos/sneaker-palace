export {};

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const shoeSchema = new mongoose.Schema({
	shoeID: { type: String, required: true },
	sku: { type: String, required: true },
	brand: { type: String, required: true },
	name: { type: String, required: true },
	colorway: { type: String },
	gender: { type: String, required: true },
	silhouette: { type: String, required: true },
	releaseYear: { type: Number, required: true },
	releaseDate: { type: String },
	retailPrice: { type: Number, required: true },
	estimatedMarketValue: { type: Number, required: true },
	story: { type: String },
	image: {
		'360': { type: Array },
		original: { type: String, required: true },
		small: { type: String, required: true },
		thumbnail: { type: String, required: true },
	},
	links: {
		stockX: { type: String },
		goat: { type: String },
		flightClub: { type: String },
		stadiumGoods: { type: String },
	},
	ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
	rating: { type: Number, default: 0 },
	favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	inStock: { type: Boolean, default: true },
});

shoeSchema.plugin(mongoosePaginate);

// Add text search index for multi-field search
shoeSchema.index({
	name: 'text',
	brand: 'text', 
	colorway: 'text',
	silhouette: 'text',
	story: 'text'
});

const Shoe = mongoose.model('Shoe', shoeSchema);

module.exports = Shoe;
