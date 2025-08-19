import { Request, Response } from 'express';

const express = require('express');
const mongoose = require('mongoose');
const Shoe = require('../models/Shoe');
const User = require('../models/User');
const { getFullURL } = require('../utils/getFullURL');
const { addAllShoes, addAllShoesByBrand, addShoeByName } = require('../utils/sneakerV2_API');


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
      case "Newest":
        return { releaseDate: -1 };
      case "Oldest":
        return { releaseDate: 1 };
      case "Price: High-Low":
        return { retailPrice: -1 };
      case "Price: Low-High":
        return { retailPrice: 1 };
    }
  };

  const getCompleteQuery = () => {
    const completeQuery: any = {};
    const filters = req.body.filters;
    if (req.body.query) {
      completeQuery.name = { "$regex": req.body.query.trim(), "$options": "i" };
    }

    const selectedColors = [...Object.keys(filters.colors).filter((color) => filters.colors[color])];

    const selectedBrands = [...Object.keys(filters.brands).filter((brand) => filters.brands[brand])];

    const selectedGenders = [...Object.keys(filters.genders).filter((gender) => filters.genders[gender])];

    const selectedPriceRanges = [...Object.keys(filters.priceRanges).filter((priceRange) => filters.priceRanges[priceRange].checked)];

    const selectedReleaseYears = [...Object.keys(filters.releaseYears).filter((releaseYear) => filters.releaseYears[releaseYear])];

    if (filters.colors && selectedColors.length > 0) {
      const regex = selectedColors.join('|');
      completeQuery.colorway = { "$regex": regex, "$options": "i" };
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
              $gte: filters.priceRanges[priceRange].priceRanges.low
            }
          });
        } else {
          priceRangeConditions.push({
            retailPrice: {
              $gte: filters.priceRanges[priceRange].priceRanges.low,
              $lte: filters.priceRanges[priceRange].priceRanges.high
            }
          });
        }
      });

      completeQuery["$or"] = [...priceRangeConditions];
    }
    return completeQuery;
  };

  const options = {
    page: Number(req.body.pageNum),
    limit: 12,
    collation: {
      locale: 'en',
    },
    lean: true,
    select: 'shoeID image.original name gender colorway ratings retailPrice brand rating',
    sort: getSortType()
  };

  const query = getCompleteQuery();

  Shoe.paginate(query, options, (err: any, result: any) => {
    return res.json(result);
  });
});

router.get('/:shoeID', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({ shoeID: req.params.shoeID });
  return res.json(shoe);
});

router.get('/objectID/:id', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({ _id: req.params.id });
  return res.json(shoe);
});

router.post('/search', async (req: Request, res: Response) => {
  const query = { "name": { "$regex": req.body.searchText.trim(), "$options": "i" } };

  const options = {
    page: Number(req.body.pageNum),
    limit: 12,
    collation: {
      locale: 'en',
    },
    lean: true,
    select: 'shoeID image.original name gender colorway ratings retailPrice brand rating',
    sort: {}
  };

  Shoe.paginate(query, options, (err: any, result: any) => {
    if (err) return res.json({ error: err });
    return res.json(result);
  });
});

router.put('/favorite', async (req: Request, res: Response) => {
  if (!req.body.shoeID || !req.body.userID) {
    return res.status(400).json({ error: 'Missing shoeID or userID' });
  }

  const shoe = await Shoe.findOne({ shoeID: req.body.shoeID });
  const user = await User.findOne({ _id: req.body.userID });

  if (!shoe.favorites.includes(req.body.userID)) {
    await shoe.updateOne({ $push: { favorites: user._id } });
    await user.updateOne({ $push: { favorites: shoe._id } });
    const updatedShoe = await Shoe.findById(shoe._id);
    const updatedUser = await User.findById(user._id);
    return res.status(200).json({ updatedShoe, updatedUser });
  } else {
    await shoe.updateOne({ $pull: { favorites: user._id } });
    await user.updateOne({ $pull: { favorites: shoe._id } });
    const updatedShoe = await Shoe.findById(shoe._id);
    const updatedUser = await User.findById(user._id);
    return res.status(200).json({ updatedShoe, updatedUser });
  }
});

router.post('/newShoes', async (req: Request, res: Response) => {
  const result = await addAllShoes(Number(req.body.page), Number(req.body.releaseYear));
  return res.json(result);
});

router.post('/newShoes/brand', async (req: Request, res: Response) => {
  const result = await addAllShoesByBrand(req.body.brand);
  return res.json(result);
});

router.post('/newShoe', async (req: Request, res: Response) => {
  const result = await addShoeByName(req.body.name);
  return res.json(result);
});

router.post('/delete', async (req: Request, res: Response) => {
  const result = await Shoe.deleteMany({ brand: { $in: ['Louis Vuitton'] } });
  return res.json(result);
});

module.exports = router;