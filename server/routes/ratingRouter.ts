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

const getAverageRating = async (ratingIDs: Array<string>) => {
  if (ratingIDs.length === 0) {
    return 0
  }

  let ratingSum = 0
  

  console.log(ratingIDs)

  for (let ratingID of ratingIDs) {
    try {
      const response = await Rating.findById(ratingID, (err: any, results: typeof Rating) => {
        console.log(results)
        if (results) {
          ratingSum += results.ratingNum
        } 
      }).clone().catch((err: any) => console.log(err))
    } catch (err) {
      console.log(err)
    }
  }

  console.log(ratingSum)



  return ratingSum / ratingIDs.length
}

router.post('/rate', async (req: Request, res: Response) => {
  console.log('new fuck')
  const rating = new Rating(req.body)
  const shoe = await Shoe.findOne({ shoeID: req.body.shoeID})
  const user = await User.findById(req.body.userID)

  console.log(shoe.ratings)

  const shoeAverageRating = await getAverageRating(shoe.ratings)

  console.log(shoeAverageRating)
  
  await shoe.updateOne({ $push: { ratings: rating._id, rating: shoeAverageRating } })
  await user.updateOne({ $push: { ratings: rating._id } })
  const updatedShoe = await Shoe.findById(shoe._id)
  const updatedUser = await User.findById(user._id)

  await rating.save()
  
  res.json({updatedShoe, updatedUser, rating})
})

router.put('/edit/:id', async (req: Request, res: Response) => {

  const updatedRating = await Rating.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );
  
  res.json(updatedRating)
})

router.put('/like', async (req: Request, res: Response) => {
  
  const rating = await Rating.findOne({_id: req.body.ratingID})
  const user = await User.findOne({_id: req.body.userID})

  try {
    if (!rating.helpful.includes(req.body.userID)) {
      await rating.updateOne({ $push: { helpful: user._id } })
      await user.updateOne({ $push: { helpful: rating._id } })
      await rating.updateOne({ $pull: { notHelpful: user._id } })
      await user.updateOne({ $pull: { notHelpful: rating._id } })
      
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      res.status(200).json({updatedRating, updatedUser})
    } else {
      await rating.updateOne({ $pull: { helpful: user._id } })
      await user.updateOne({ $pull: { helpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      res.status(200).json({updatedRating, updatedUser})
    }
  } catch (err) {
    res.json(err)
  }
  res.json(rating)
})

router.put('/dislike', async (req: Request, res: Response) => {
  
  const rating = await Rating.findOne({_id: req.body.ratingID})
  const user = await User.findOne({_id: req.body.userID})

  try {
    if (!rating.notHelpful.includes(req.body.userID)) {
      await rating.updateOne({ $push: { notHelpful: user._id } })
      await user.updateOne({ $push: { notHelpful: rating._id } })
      await rating.updateOne({ $pull: { helpful: user._id } })
      await user.updateOne({ $pull: { helpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      res.status(200).json({updatedRating, updatedUser})
    } else {
      await rating.updateOne({ $pull: { notHelpful: user._id } })
      await user.updateOne({ $pull: { notHelpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      res.status(200).json({updatedRating, updatedUser})
    }
  } catch (err) {
    res.json(err)
  }
  res.json(rating)
})

router.delete('/:id', async (req: Request, res: Response) => {
  console.log(req.params)
  const deletedRating = await Rating.findByIdAndDelete(req.params.id)
  res.json(deletedRating)
})






module.exports = router;