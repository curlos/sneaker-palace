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
