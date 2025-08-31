import { Request, Response } from 'express';

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

	const getCompleteQuery = () => {
		const completeQuery: any = {};
		const filters = req.body.filters;
		if (req.body.query) {
			completeQuery.name = { $regex: req.body.query.trim(), $options: 'i' };
		}

		const selectedColors = [...Object.keys(filters.colors).filter((color) => filters.colors[color])];

		const selectedBrands = [...Object.keys(filters.brands).filter((brand) => filters.brands[brand])];

		const selectedGenders = [...Object.keys(filters.genders).filter((gender) => filters.genders[gender])];

		const selectedPriceRanges = [
			...Object.keys(filters.priceRanges).filter((priceRange) => filters.priceRanges[priceRange].checked),
		];

		const selectedReleaseYears = [
			...Object.keys(filters.releaseYears).filter((releaseYear) => filters.releaseYears[releaseYear]),
		];

		if (filters.colors && selectedColors.length > 0) {
			const regex = selectedColors.join('|');
			completeQuery.colorway = { $regex: regex, $options: 'i' };
		}

		if (filters.brands && selectedBrands.length > 0) {
			completeQuery.brand = { $in: selectedBrands };
		}

		if (filters.genders && selectedGenders.length > 0) {
			completeQuery.gender = { $in: selectedGenders };
		}

		if (filters.releaseYears && selectedReleaseYears.length > 0) {
			completeQuery.releaseYear = { $in: selectedReleaseYears };
		}

		if (filters.priceRanges && selectedPriceRanges.length > 0) {
			const priceRangeConditions: any = [];

			selectedPriceRanges.forEach((priceRange) => {
				if (!filters.priceRanges[priceRange].priceRanges.high) {
					priceRangeConditions.push({
						retailPrice: {
							$gte: filters.priceRanges[priceRange].priceRanges.low,
						},
					});
				} else {
					priceRangeConditions.push({
						retailPrice: {
							$gte: filters.priceRanges[priceRange].priceRanges.low,
							$lte: filters.priceRanges[priceRange].priceRanges.high,
						},
					});
				}
			});

			completeQuery['$or'] = [...priceRangeConditions];
		}
		return completeQuery;
	};

	if (isArrayLengthSort()) {
		const pipeline = [
			{ $match: getCompleteQuery() },
			{
				$addFields: {
					favoritesCount: { $size: '$favorites' },
					ratingsCount: { $size: '$ratings' }
				}
			},
			{ $sort: getArraySortDirection() }
		];

		const pageNum = Number(req.body.pageNum);
		const limit = 12;
		const skip = (pageNum - 1) * limit;

		try {
			const [results, totalCount] = await Promise.all([
				Shoe.aggregate([
					...pipeline,
					{ $skip: skip },
					{ $limit: limit },
					{
						$project: {
							shoeID: 1,
							'image.original': 1,
							name: 1,
							gender: 1,
							colorway: 1,
							ratings: 1,
							retailPrice: 1,
							brand: 1,
							rating: 1,
							favorites: 1
						}
					}
				]),
				Shoe.aggregate([
					...pipeline,
					{ $count: 'total' }
				])
			]);

			const total = totalCount[0]?.total || 0;
			const totalPages = Math.ceil(total / limit);

			const paginatedResult = {
				docs: results,
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
			return res.status(500).json({ error: 'Error fetching shoes' });
		}
	} else {
		const options = {
			page: Number(req.body.pageNum),
			limit: 12,
			collation: {
				locale: 'en',
			},
			lean: true,
			select: 'shoeID image.original name gender colorway ratings retailPrice brand rating favorites',
			sort: getSortType(),
		};

		const query = getCompleteQuery();

		Shoe.paginate(query, options, (_err: any, result: any) => {
			return res.json(result);
		});
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

router.post('/search', async (req: Request, res: Response) => {
	const query = { name: { $regex: req.body.searchText.trim(), $options: 'i' } };

	const options = {
		page: Number(req.body.pageNum),
		limit: 12,
		collation: {
			locale: 'en',
		},
		lean: true,
		select: 'shoeID image.original name gender colorway ratings retailPrice brand rating',
		sort: {},
	};

	Shoe.paginate(query, options, (err: any, result: any) => {
		if (err) return res.json({ error: err });
		return res.json(result);
	});
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
