import mongoose from 'mongoose';

export interface IShoe {
	shoeID: string;
	sku: string;
	brand: string;
	name: string;
	colorway?: string;
	gender: string;
	silhouette: string;
	releaseYear: number;
	releaseDate?: string;
	retailPrice: number;
	estimatedMarketValue: number;
	story?: string;
	image: {
		'360': Array<string>;
		original: string;
		small: string;
		thumbnail: string;
	};
	links: {
		stockX?: string;
		goat?: string;
		flightClub?: string;
		stadiumGoods?: string;
	};
	ratings: Array<mongoose.Types.ObjectId>;
	rating: number;
	favorites: Array<mongoose.Types.ObjectId>;
	inStock: boolean;
}

export interface UserType {
	id: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	isAdmin: boolean;
	profilePic: string;
	reviews: Array<string>;
	shoeFavorites: Array<string>;
	reviewUpvotes: Array<string>;
	reviewDownvotes: Array<string>;
	itemsBought: Array<string>;
	lowerCaseEmail: string;
	createdAt: Date;
	updatedAt: Date;
}
