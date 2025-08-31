import { Shoe } from '../types/types';

export {};

export const sortByOldest = (shoesToSort: Array<Shoe>) => {
	const shoesToSortClone = [...shoesToSort];

	return shoesToSortClone.sort((shoeOne, shoeTwo) => {
		const shoeOneReleaseDate = new Date(shoeOne.releaseDate).getTime();
		const shoeTwoReleaseDate = new Date(shoeTwo.releaseDate).getTime();

		return shoeOneReleaseDate > shoeTwoReleaseDate ? 1 : -1;
	});
};

export const sortByNewest = (shoesToSort: Array<Shoe>) => {
	const shoesToSortClone = [...shoesToSort];

	return shoesToSortClone.sort((shoeOne, shoeTwo) => {
		const shoeOneReleaseDate = new Date(shoeOne.releaseDate).getTime();
		const shoeTwoReleaseDate = new Date(shoeTwo.releaseDate).getTime();

		return shoeOneReleaseDate > shoeTwoReleaseDate ? -1 : 1;
	});
};

export const sortByLowestPrice = (shoesToSort: Array<Shoe>) =>
	[...shoesToSort].sort((shoeOne, shoeTwo) => (shoeOne.retailPrice > shoeTwo.retailPrice ? 1 : -1));

export const sortByHighestPrice = (shoesToSort: Array<Shoe>) =>
	[...shoesToSort].sort((shoeOne, shoeTwo) => (shoeOne.retailPrice > shoeTwo.retailPrice ? -1 : 1));

export const sortByMostPopular = (shoesToSort: Array<Shoe>) =>
	[...shoesToSort].sort((shoeOne, shoeTwo) => shoeTwo.favorites.length - shoeOne.favorites.length);

export const sortByMostReviewed = (shoesToSort: Array<Shoe>) =>
	[...shoesToSort].sort((shoeOne, shoeTwo) => shoeTwo.ratings.length - shoeOne.ratings.length);

export const sortByHighestRated = (shoesToSort: Array<Shoe>) =>
	[...shoesToSort].sort((shoeOne, shoeTwo) => (shoeTwo.rating > shoeOne.rating ? 1 : -1));

