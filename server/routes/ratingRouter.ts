export {}
import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')
const Rating = require('../models/Rating')
const Shoe = require('../models/Shoe')
const User = require('../models/User')

const router = express.Router()

router.get('/:ratingID', async (req: Request, res: Response) => {
  const rating = await Rating.findById(req.params.ratingID)
  res.json(rating)
})

router.post('/rate', async (req: Request, res: Response) => {
  try {
    const rating = new Rating(req.body)
    const shoe = await Shoe.findOne({ shoeID: req.body.shoeID})
    const user = await User.findById(req.body.userID)
    
    await shoe.updateOne({ $push: { ratings: rating._id } })
    await user.updateOne({ $push: { ratings: rating._id } })
    const updatedShoe = await Shoe.findById(shoe._id)
    const updatedUser = await User.findById(user._id)

    await rating.save()
    
    res.json({updatedShoe, updatedUser, rating})
  } catch (err) {
    res.json(err)
  }
})

// router.put('/helpful', async (req: Request, res: Response) => {
//   const shoe = await Shoe.findOne({shoeID: req.body.shoeID})
//   const user = await User.findOne({_id: req.body.userID})

//   if (!shoe.favorites.includes(req.body.userID)) {
//     await shoe.updateOne({ $push: { favorites: user._id } })
//     await user.updateOne({ $push: { favorites: shoe._id } })
//     const updatedShoe = await Shoe.findById(shoe._id)
//     const updatedUser = await User.findById(user._id)
//     res.status(200).json({updatedShoe, updatedUser})
//   } else {
//     await shoe.updateOne({ $pull: { favorites: user._id } })
//     await user.updateOne({ $pull: { favorites: shoe._id } })
//     const updatedShoe = await Shoe.findById(shoe._id)
//     const updatedUser = await User.findById(user._id)
//     res.status(200).json({updatedShoe, updatedUser})
//   }
//   res.json(shoe)
// })

module.exports = router;