export {}
import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')
const Shoe = require('../models/Shoe')
const User = require('../models/User')
const { getShoesFromBrand, getShoesFromAllBrands } = require('../utils/sneakerV2_API')

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  const allShoes = await Shoe.find({})
  res.json(allShoes)
})

router.get('/:shoeID', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({shoeID: req.params.shoeID})
  res.json(shoe)
})

router.get('/query/:queryText', async (req: Request, res: Response) => {
  const shoes = await Shoe
                    .find({ "name": { "$regex": req.params.queryText.trim(), "$options": "i" } })
    console.log(shoes.length)
    res.json(shoes)

  })

router.put('/favorite', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({shoeID: req.body.shoeID})
  const user = await User.findOne({_id: req.body.userID})

  if (!shoe.favorites.includes(req.body.userID)) {
    await shoe.updateOne({ $push: { favorites: user._id } })
    await user.updateOne({ $push: { favorites: shoe._id } })
    const updatedShoe = await Shoe.findById(shoe._id)
    const updatedUser = await User.findById(user._id)
    res.status(200).json({updatedShoe, updatedUser})
  } else {
    await shoe.updateOne({ $pull: { favorites: user._id } })
    await user.updateOne({ $pull: { favorites: shoe._id } })
    const updatedShoe = await Shoe.findById(shoe._id)
    const updatedUser = await User.findById(user._id)
    res.status(200).json({updatedShoe, updatedUser})
  }
  res.json(shoe)
})












router.post('/newShoe', async (req: Request, res: Response) => {
  console.log(getShoesFromBrand)
  await getShoesFromBrand(req.body.brand)
  res.json('All new shoes added to database')
})

router.post('/newShoe/allBrands', async (req: Request, res: Response) => {
  console.log(getShoesFromAllBrands)
  await getShoesFromAllBrands()
  res.json('All new shoes added to database')
})

module.exports = router;