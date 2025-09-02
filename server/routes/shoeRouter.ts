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

	const getSelectedFilters = () => {
		const filters = req.body.filters;
		return {
			selectedColors: [...Object.keys(filters.colors).filter((color) => filters.colors[color])],
			selectedBrands: [...Object.keys(filters.brands).filter((brand) => filters.brands[brand])],
			selectedGenders: [...Object.keys(filters.genders).filter((gender) => filters.genders[gender])],
			selectedPriceRanges: [...Object.keys(filters.priceRanges).filter((priceRange) => filters.priceRanges[priceRange].checked)],
			selectedReleaseYears: [...Object.keys(filters.releaseYears).filter((releaseYear) => filters.releaseYears[releaseYear])],
			filters
		};
	};

	const buildFilterMatch = () => {
		const { selectedColors, selectedBrands, selectedGenders, selectedPriceRanges, selectedReleaseYears, filters } = getSelectedFilters();
		const matchConditions: any = {};

		if (selectedColors.length > 0) {
			const regex = selectedColors.join('|');
			matchConditions.colorway = { $regex: regex, $options: 'i' };
		}

		if (selectedBrands.length > 0) {
			matchConditions.brand = { $in: selectedBrands };
		}

		if (selectedGenders.length > 0) {
			matchConditions.gender = { $in: selectedGenders };
		}

		if (selectedReleaseYears.length > 0) {
			matchConditions.releaseYear = { $in: selectedReleaseYears };
		}

		if (selectedPriceRanges.length > 0) {
			const priceRangeConditions: any = [];
			selectedPriceRanges.forEach((priceRange) => {
				const range = filters.priceRanges[priceRange].priceRanges;
				if (!range.high) {
					priceRangeConditions.push({ retailPrice: { $gte: range.low } });
				} else {
					priceRangeConditions.push({ 
						retailPrice: { $gte: range.low, $lte: range.high } 
					});
				}
			});
			matchConditions['$or'] = priceRangeConditions;
		}

		return matchConditions;
	};

	const buildPipeline = () => {
		const pipeline: any[] = [];
		const pageNum = Number(req.body.pageNum);
		const limit = req.body.limit || 12;
		const skip = (pageNum - 1) * limit;

		// Step 1: Search or match stage
		if (req.body.query && req.body.query.trim()) {
			// Use Atlas Search
			pipeline.push({
				$search: {
					index: "search_shoes",
					compound: {
						must: [
							{
								text: {
									query: req.body.query.trim(),
									path: ["name", "brand", "colorway", "silhouette", "story"],
									fuzzy: { 
										maxEdits: 1,
										prefixLength: 3
									}
								}
							}
						],
						should: [
							{
								text: {
									query: req.body.query.trim(),
									path: "name",
									score: { boost: { value: 10 } }
								}
							},
							{
								text: {
									query: req.body.query.trim(),
									path: "brand", 
									score: { boost: { value: 8 } }
								}
							},
							{
								text: {
									query: req.body.query.trim(),
									path: "colorway",
									score: { boost: { value: 5 } }
								}
							},
							{
								text: {
									query: req.body.query.trim(),
									path: "silhouette",
									score: { boost: { value: 4 } }
								}
							},
							{
								text: {
									query: req.body.query.trim(),
									path: "story",
									score: { boost: { value: 2 } }
								}
							}
						]
					}
				}
			});

			// Add search score
			pipeline.push({
				$addFields: {
					score: { $meta: "searchScore" }
				}
			});
		}

		// Step 2: For search queries, keep only results within 10% of max score
		if (req.body.query && req.body.query.trim()) {
			// Group to find max score
			pipeline.push({
				$group: {
					_id: null,
					maxScore: { $max: "$score" },
					docs: { $push: "$$ROOT" }
				}
			});
			
			// Unwind back to individual documents
			pipeline.push({
				$unwind: "$docs"
			});
			
			// Replace root and add maxScore to each document
			pipeline.push({
				$replaceRoot: { 
					newRoot: {
						$mergeObjects: ["$docs", { maxScore: "$maxScore" }]
					}
				}
			});
			
			// Keep only results within 10% of max score (90% threshold)
			pipeline.push({
				$match: {
					$expr: {
						$gte: ["$score", { $multiply: ["$maxScore", 0.5] }] // 50% of max score
					}
				}
			});
			
			// Remove the temporary maxScore field
			pipeline.push({
				$project: {
					maxScore: 0
				}
			});
		}

		// Step 3: Apply filters
		const filterMatch = buildFilterMatch();
		if (Object.keys(filterMatch).length > 0) {
			pipeline.push({ $match: filterMatch });
		}

		// Step 4: Handle array-based sorting (favorites/ratings count)
		if (isArrayLengthSort()) {
			pipeline.push({
				$addFields: {
					favoritesCount: { $size: '$favorites' },
					ratingsCount: { $size: '$ratings' }
				}
			});
			pipeline.push({ $sort: getArraySortDirection() });
		} else {
			// Step 5: Regular sorting (skip for search with "Most Relevant")
			if (!(req.body.query && req.body.sortType === 'Most Relevant')) {
				pipeline.push({ $sort: getSortType() });
			}
		}

		return { pipeline, pageNum, limit, skip };
	};

	try {
		const { pipeline, pageNum, limit, skip } = buildPipeline();
		

		// Execute aggregation with pagination
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
						favorites: 1,
						score: 1
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
		console.error('Search error:', error);
		
		// Fallback to text search if Atlas Search fails
		if (req.body.query && req.body.query.trim()) {
			try {
				const fallbackPageNum = Number(req.body.pageNum);
				const fallbackLimit = req.body.limit || 12;
				const fallbackSkip = (fallbackPageNum - 1) * fallbackLimit;
				
				const fallbackResults = await Shoe.find(
					{ 
						$text: { $search: req.body.query.trim() },
						...buildFilterMatch()
					},
					{ score: { $meta: "textScore" } }
				)
				.sort({ score: { $meta: "textScore" } })
				.limit(fallbackLimit)
				.skip(fallbackSkip)
				.lean();

				return res.json({
					docs: fallbackResults,
					totalDocs: fallbackResults.length,
					limit: fallbackLimit, 
					page: fallbackPageNum, 
					totalPages: 1,
					hasNextPage: false, 
					hasPrevPage: false,
					nextPage: null, 
					prevPage: null, 
					pagingCounter: 1
				});
			} catch (fallbackError) {
				return res.status(500).json({ error: 'Error fetching shoes' });
			}
		}
		
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
