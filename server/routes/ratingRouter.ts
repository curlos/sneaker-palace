import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')
const Rating = require('../models/Rating')
const Shoe = require('../models/Shoe')
const User = require('../models/User')

const router = express.Router()

router.get('/:ratingID', async (req: Request, res: Response) => {
  const rating = await Rating.findById(req.params.ratingID)
  return res.json(rating)
})

const getAverageRating = async (ratingIDs: Array<string>, currentAverageRating: number, newRatingNum: number) => {
  return ((currentAverageRating * ratingIDs.length) + newRatingNum) / (ratingIDs.length + 1)
}

router.post('/rate', async (req: Request, res: Response) => {
  const rating = new Rating(req.body)
  const shoe = await Shoe.findOne({ shoeID: req.body.shoeID })
  const user = await User.findById(req.body.userID)
  const newShoeAverageRating = await getAverageRating(shoe.ratings, shoe.rating || 0, req.body.ratingNum)



  shoe.rating = newShoeAverageRating
  await shoe.updateOne({ $push: { ratings: rating._id } })
  await user.updateOne({ $push: { ratings: rating._id } })
  await rating.save()
  await shoe.save()



  const updatedShoe = await Shoe.findById(shoe._id)
  const updatedUser = await User.findById(user._id)

  return res.json({ updatedShoe, updatedUser, rating })
})

router.put('/edit/:id', async (req: Request, res: Response) => {

  const updatedRating = await Rating.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  );

  return res.json(updatedRating)
})

router.put('/like', async (req: Request, res: Response) => {

  const rating = await Rating.findOne({ _id: req.body.ratingID })
  const user = await User.findOne({ _id: req.body.userID })

  try {
    if (!rating.helpful.includes(req.body.userID)) {
      await rating.updateOne({ $push: { helpful: user._id } })
      await user.updateOne({ $push: { helpful: rating._id } })
      await rating.updateOne({ $pull: { notHelpful: user._id } })
      await user.updateOne({ $pull: { notHelpful: rating._id } })

      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      return res.status(200).json({ updatedRating, updatedUser })
    } else {
      await rating.updateOne({ $pull: { helpful: user._id } })
      await user.updateOne({ $pull: { helpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      return res.status(200).json({ updatedRating, updatedUser })
    }
  } catch (err) {
    return res.json(err)
  }
})

router.put('/dislike', async (req: Request, res: Response) => {

  const rating = await Rating.findOne({ _id: req.body.ratingID })
  const user = await User.findOne({ _id: req.body.userID })

  try {
    if (!rating.notHelpful.includes(req.body.userID)) {
      await rating.updateOne({ $push: { notHelpful: user._id } })
      await user.updateOne({ $push: { notHelpful: rating._id } })
      await rating.updateOne({ $pull: { helpful: user._id } })
      await user.updateOne({ $pull: { helpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      return res.status(200).json({ updatedRating, updatedUser })
    } else {
      await rating.updateOne({ $pull: { notHelpful: user._id } })
      await user.updateOne({ $pull: { notHelpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      return res.status(200).json({ updatedRating, updatedUser })
    }
  } catch (err) {
    return res.json(err)
  }
})

router.delete('/:id', async (req: Request, res: Response) => {

  const deletedRating = await Rating.findByIdAndDelete(req.params.id)
  return res.json(deletedRating)
})


module.exports = router;