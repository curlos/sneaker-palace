import { Request, Response } from 'express';
import { searchService } from '../services/searchService';

const express = require('express');
const Shoe = require('../models/Shoe');
const User = require('../models/User');
const { verifyToken } = require('./verifyToken');

const router = express.Router();

router.get('/page/:pageNum', async (req: Request, res: Response) => {
	const options = {
		page: Number(req.params.pageNum),
		limit: 12,
		collation: {
			locale: 'en',
		},
		lean: true,
		select: 'shoeID image.original name gender colorway ratings retailPrice brand rating',
	};

	Shoe.paginate({}, options, (err: any, result: any) => {
		return res.json(result);
	});
});

router.post('/', async (req: Request, res: Response) => {
	const getSortType = () => {
		switch (req.body.sortType) {
			case 'Newest Arrivals':
				return { releaseDate: -1 };
			case 'Classic Releases':
				return { releaseDate: 1 };
			case 'Price: High to Low':
				return { retailPrice: -1 };
			case 'Price: Low to High':
				return { retailPrice: 1 };
			case 'Highest Rated':
				return { rating: -1 };
			case 'Most Relevant':
				// Only use text score if there's actually a text search query
				return req.body.query ? { score: { $meta: 'textScore' } } : { releaseDate: -1 };
			default:
				return { releaseDate: -1 };
		}
	};

	const isArrayLengthSort = () => {
		return ['Most Popular', 'Most Reviewed'].includes(req.body.sortType);
	};

	const getArraySortDirection = () => {
		switch (req.body.sortType) {
			case 'Most Popular':
				return { favoritesCount: -1 };
			case 'Most Reviewed':
				return { ratingsCount: -1 };
			default:
				return { favoritesCount: -1 };
		}
	};

	const applyFilters = (shoes: any[]) => {
		const filters = req.body.filters;
		
		const selectedColors = [...Object.keys(filters.colors).filter((color) => filters.colors[color])];
		const selectedBrands = [...Object.keys(filters.brands).filter((brand) => filters.brands[brand])];
		const selectedGenders = [...Object.keys(filters.genders).filter((gender) => filters.genders[gender])];
		const selectedPriceRanges = [
			...Object.keys(filters.priceRanges).filter((priceRange) => filters.priceRanges[priceRange].checked),
		];
		const selectedReleaseYears = [
			...Object.keys(filters.releaseYears).filter((releaseYear) => filters.releaseYears[releaseYear]),
		];

		return shoes.filter((shoe) => {
			// Color filter
			if (selectedColors.length > 0) {
				const regex = new RegExp(selectedColors.join('|'), 'i');
				if (!regex.test(shoe.colorway)) return false;
			}

			// Brand filter
			if (selectedBrands.length > 0) {
				if (!selectedBrands.includes(shoe.brand)) return false;
			}

			// Gender filter
			if (selectedGenders.length > 0) {
				if (!selectedGenders.includes(shoe.gender)) return false;
			}

			// Release year filter
			if (selectedReleaseYears.length > 0) {
				if (!selectedReleaseYears.includes(shoe.releaseYear)) return false;
			}

			// Price range filter
			if (selectedPriceRanges.length > 0) {
				const matchesPriceRange = selectedPriceRanges.some((priceRange) => {
					const range = filters.priceRanges[priceRange].priceRanges;
					if (!range.high) {
						return shoe.retailPrice >= range.low;
					} else {
						return shoe.retailPrice >= range.low && shoe.retailPrice <= range.high;
					}
				});
				if (!matchesPriceRange) return false;
			}

			return true;
		});
	};

	try {
		// Ensure search service is initialized
		if (!searchService.isReady()) {
			console.log('Search service not ready, initializing...');
			await searchService.initialize();
		}

		// Get shoes from search service (FuseJS)
		let shoes: any[];
		if (req.body.query && req.body.query.trim()) {
			shoes = searchService.search(req.body.query.trim());
		} else {
			shoes = searchService.getAllShoes();
		}

		// Apply filters
		const filteredShoes = applyFilters(shoes);

		// Handle array-based sorting (favorites/ratings count)
		if (isArrayLengthSort()) {
			// Add computed fields and sort
			const shoesWithCounts = filteredShoes.map((shoe) => ({
				...shoe,
				favoritesCount: shoe.favorites ? shoe.favorites.length : 0,
				ratingsCount: shoe.ratings ? shoe.ratings.length : 0,
			}));

			const sortDirection = getArraySortDirection();
			const sortKey = Object.keys(sortDirection)[0] as 'favoritesCount' | 'ratingsCount';
			const sortOrder = (sortDirection as any)[sortKey];

			shoesWithCounts.sort((a, b) => {
				const aVal = sortKey === 'favoritesCount' ? a.favoritesCount : a.ratingsCount;
				const bVal = sortKey === 'favoritesCount' ? b.favoritesCount : b.ratingsCount;
				
				if (sortOrder === -1) {
					return bVal - aVal;
				} else {
					return aVal - bVal;
				}
			});

			filteredShoes.splice(0, filteredShoes.length, ...shoesWithCounts);
		} else {
			// Handle regular sorting
			const sortType = getSortType();
			
			if (req.body.query && req.body.sortType === 'Most Relevant') {
				// For search queries with "Most Relevant", keep FuseJS ranking
				// FuseJS already provides the best ranking for search results
			} else {
				// Apply other sort types
				const sortKey = Object.keys(sortType)[0];
				const sortOrder = (sortType as any)[sortKey];

				filteredShoes.sort((a, b) => {
					let aVal: any, bVal: any;
					
					if (sortKey === 'releaseDate') {
						aVal = a.releaseDate;
						bVal = b.releaseDate;
					} else if (sortKey === 'retailPrice') {
						aVal = a.retailPrice;
						bVal = b.retailPrice;
					} else if (sortKey === 'rating') {
						aVal = a.rating;
						bVal = b.rating;
					} else {
						aVal = a[sortKey];
						bVal = b[sortKey];
					}
					
					if (sortOrder === -1) {
						return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
					} else {
						return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
					}
				});
			}
		}

		// Pagination
		const pageNum = Number(req.body.pageNum);
		const limit = 12;
		const skip = (pageNum - 1) * limit;
		const total = filteredShoes.length;
		const totalPages = Math.ceil(total / limit);

		const paginatedShoes = filteredShoes.slice(skip, skip + limit);

		// Format response to match existing API
		const paginatedResult = {
			docs: paginatedShoes.map((shoe) => ({
				shoeID: shoe.shoeID,
				image: { original: shoe.image.original },
				name: shoe.name,
				gender: shoe.gender,
				colorway: shoe.colorway,
				ratings: shoe.ratings,
				retailPrice: shoe.retailPrice,
				brand: shoe.brand,
				rating: shoe.rating,
				favorites: shoe.favorites
			})),
			totalDocs: total,
			limit: limit,
			page: pageNum,
			totalPages: totalPages,
			hasNextPage: pageNum < totalPages,
			hasPrevPage: pageNum > 1,
			nextPage: pageNum < totalPages ? pageNum + 1 : null,
			prevPage: pageNum > 1 ? pageNum - 1 : null,
			pagingCounter: skip + 1
		};

		return res.json(paginatedResult);
	} catch (error) {
		console.error('Search error:', error);
		return res.status(500).json({ error: 'Error fetching shoes' });
	}
});

router.get('/:shoeID', async (req: Request, res: Response) => {
	const shoe = await Shoe.findOne({ shoeID: req.params.shoeID });
	return res.json(shoe);
});

router.get('/objectID/:id', async (req: Request, res: Response) => {
	const shoe = await Shoe.findOne({ _id: req.params.id });
	return res.json(shoe);
});

router.post('/objectIDs', async (req: Request, res: Response) => {
	const { ids } = req.body;

	if (!ids || !Array.isArray(ids)) {
		return res.status(400).json({ error: 'Invalid or missing ids array' });
	}

	const shoes = await Shoe.find({ _id: { $in: ids } });
	return res.json(shoes);
});

router.post('/bulk', async (req: Request, res: Response) => {
	const { ids, key = '_id' } = req.body;

	if (!ids || !Array.isArray(ids)) {
		return res.status(400).json({ error: 'Invalid or missing ids array' });
	}

	const validKeys = ['_id', 'shoeID'];
	if (!validKeys.includes(key)) {
		return res.status(400).json({ error: 'Invalid key. Must be one of: ' + validKeys.join(', ') });
	}

	const shoes = await Shoe.find({ [key]: { $in: ids } });
	return res.json(shoes);
});


router.put('/favorite/:shoeID', verifyToken, async (req: Request, res: Response) => {
	const shoe = await Shoe.findOne({ shoeID: req.params.shoeID });
	const user = await User.findOne({ _id: req.user.id });

	if (!shoe.favorites.includes(req.user.id)) {
		await shoe.updateOne({ $push: { favorites: user._id } });
		await user.updateOne({ $push: { favorites: shoe._id } });
		const updatedShoe = await Shoe.findById(shoe._id);
		const updatedUser = await User.findById(user._id);
		const { password, ...userWithoutPassword } = updatedUser._doc;
		return res.status(200).json({ updatedShoe, updatedUser: userWithoutPassword });
	} else {
		await shoe.updateOne({ $pull: { favorites: user._id } });
		await user.updateOne({ $pull: { favorites: shoe._id } });
		const updatedShoe = await Shoe.findById(shoe._id);
		const updatedUser = await User.findById(user._id);
		const { password, ...userWithoutPassword } = updatedUser._doc;
		return res.status(200).json({ updatedShoe, updatedUser: userWithoutPassword });
	}
});

module.exports = router;
