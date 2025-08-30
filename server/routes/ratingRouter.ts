import { Request, Response } from 'express'

const express = require('express')
const Rating = require('../models/Rating')
const Shoe = require('../models/Shoe')
const User = require('../models/User')
const { verifyToken } = require('./verifyToken')

const router = express.Router()

router.get('/:ratingID', async (req: Request, res: Response) => {
  const rating = await Rating.findById(req.params.ratingID)
  return res.json(rating)
})

// Get all ratings by type (shoe or user) with author data
router.get('/by/:type/:id', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params
    
    let query = {}
    if (type === 'shoe') {
      query = { shoeID: id }
    } else if (type === 'user') {
      query = { userID: id }
    } else {
      return res.status(400).json({ error: 'Invalid type. Must be "shoe" or "user"' })
    }

    const ratings = await Rating.find(query)
    const ratingsWithAuthors = []

    for (const rating of ratings) {
      const user = await User.findById(rating.userID).select('-password')
      ratingsWithAuthors.push({
        ...rating.toObject(),
        postedByUser: user
      })
    }

    return res.json(ratingsWithAuthors)
  } catch (error) {
    return res.status(500).json({ error: `Failed to fetch ratings for ${req.params.type}` })
  }
})

// Helper functions for efficient rating calculations
const addRatingToAverage = (currentAvg: number, currentCount: number, newRating: number) => {
  if (currentCount === 0) return newRating
  return (currentAvg * currentCount + newRating) / (currentCount + 1)
}

const updateRatingInAverage = (currentAvg: number, currentCount: number, oldRating: number, newRating: number) => {
  if (currentCount === 0) return newRating
  return currentAvg + (newRating - oldRating) / currentCount
}

const removeRatingFromAverage = (currentAvg: number, currentCount: number, removedRating: number) => {
  if (currentCount <= 1) return 0
  return (currentAvg * currentCount - removedRating) / (currentCount - 1)
}

router.post('/rate', verifyToken, async (req: Request, res: Response) => {
  try {
    const rating = new Rating({ ...req.body, userID: req.user.id })
    const shoe = await Shoe.findOne({ shoeID: req.body.shoeID })
    const user = await User.findById(req.user.id)
    
    if (!shoe || !user) {
      return res.status(404).json({ error: 'Shoe or user not found' })
    }

    const currentRatingCount = shoe.ratings.length
    const newShoeAverageRating = addRatingToAverage(shoe.rating || 0, currentRatingCount, req.body.ratingNum)

    shoe.rating = newShoeAverageRating
    await shoe.updateOne({ $push: { ratings: rating._id } })
    await user.updateOne({ $push: { ratings: rating._id } })
    await rating.save()
    await shoe.save()

    const updatedShoe = await Shoe.findById(shoe._id)
    const updatedUser = await User.findById(user._id)
    const { password, ...userWithoutPassword } = updatedUser._doc

    return res.json({ updatedShoe, updatedUser: userWithoutPassword, rating })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create rating' })
  }
})

router.put('/edit/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const oldRating = await Rating.findById(req.params.id)
    if (!oldRating) {
      return res.status(404).json({ error: 'Rating not found' })
    }
    
    if (oldRating.userID !== req.user.id) {
      return res.status(403).json({ error: 'Access denied - not your rating' })
    }

    const updatedRating = await Rating.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )

    // Update shoe rating if ratingNum changed
    if (req.body.ratingNum && req.body.ratingNum !== oldRating.ratingNum) {
      const shoe = await Shoe.findOne({ shoeID: oldRating.shoeID })
      if (shoe) {
        const currentRatingCount = shoe.ratings.length
        const newShoeAverageRating = updateRatingInAverage(
          shoe.rating || 0, 
          currentRatingCount, 
          oldRating.ratingNum, 
          req.body.ratingNum
        )
        shoe.rating = newShoeAverageRating
        await shoe.save()
      }
    }

    return res.json(updatedRating)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update rating' })
  }
})

router.put('/like', verifyToken, async (req: Request, res: Response) => {

  const rating = await Rating.findOne({ _id: req.body.ratingID })
  const user = await User.findOne({ _id: req.user.id })

  try {
    if (!rating.helpful.includes(req.user.id)) {
      await rating.updateOne({ $push: { helpful: user._id } })
      await user.updateOne({ $push: { helpful: rating._id } })
      await rating.updateOne({ $pull: { notHelpful: user._id } })
      await user.updateOne({ $pull: { notHelpful: rating._id } })

      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      const { password, ...userWithoutPassword } = updatedUser._doc
      return res.status(200).json({ updatedRating, updatedUser: userWithoutPassword })
    } else {
      await rating.updateOne({ $pull: { helpful: user._id } })
      await user.updateOne({ $pull: { helpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      const { password, ...userWithoutPassword } = updatedUser._doc
      return res.status(200).json({ updatedRating, updatedUser: userWithoutPassword })
    }
  } catch (err) {
    return res.json(err)
  }
})

router.put('/dislike', verifyToken, async (req: Request, res: Response) => {

  const rating = await Rating.findOne({ _id: req.body.ratingID })
  const user = await User.findOne({ _id: req.user.id })

  try {
    if (!rating.notHelpful.includes(req.user.id)) {
      await rating.updateOne({ $push: { notHelpful: user._id } })
      await user.updateOne({ $push: { notHelpful: rating._id } })
      await rating.updateOne({ $pull: { helpful: user._id } })
      await user.updateOne({ $pull: { helpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      const { password, ...userWithoutPassword } = updatedUser._doc
      return res.status(200).json({ updatedRating, updatedUser: userWithoutPassword })
    } else {
      await rating.updateOne({ $pull: { notHelpful: user._id } })
      await user.updateOne({ $pull: { notHelpful: rating._id } })
      const updatedRating = await Rating.findById(rating._id)
      const updatedUser = await User.findById(user._id)
      const { password, ...userWithoutPassword } = updatedUser._doc
      return res.status(200).json({ updatedRating, updatedUser: userWithoutPassword })
    }
  } catch (err) {
    return res.json(err)
  }
})

router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const ratingToDelete = await Rating.findById(req.params.id)
    if (!ratingToDelete) {
      return res.status(404).json({ error: 'Rating not found' })
    }
    
    if (ratingToDelete.userID !== req.user.id) {
      return res.status(403).json({ error: 'Access denied - not your rating' })
    }

    const shoe = await Shoe.findOne({ shoeID: ratingToDelete.shoeID })
    const user = await User.findById(ratingToDelete.userID)

    // Delete the rating
    const deletedRating = await Rating.findByIdAndDelete(req.params.id)

    // Update shoe rating and remove rating reference
    if (shoe) {
      const currentRatingCount = shoe.ratings.length
      const newShoeAverageRating = removeRatingFromAverage(
        shoe.rating || 0, 
        currentRatingCount, 
        ratingToDelete.ratingNum
      )
      shoe.rating = newShoeAverageRating
      await shoe.updateOne({ $pull: { ratings: req.params.id } })
      await shoe.save()
    }

    // Remove rating reference from user
    if (user) {
      await user.updateOne({ $pull: { ratings: req.params.id } })
    }

    // Get the updated shoe with fresh data for the response
    const updatedShoe = await Shoe.findById(shoe?._id)
    return res.json({ deletedRating, updatedShoe })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete rating' })
  }
})

// Reset all shoe ratings to 0 and delete all ratings
// TODO: Add auth. This one's kind of weird. Maybe hide this behind admin access or something...
router.put('/reset-all-ratings', async (req: Request, res: Response) => {
  try {
    // Delete all ratings from the database
    const deletedRatings = await Rating.deleteMany({})
    
    // Reset all shoe ratings to 0 and clear ratings arrays
    const updatedShoes = await Shoe.updateMany(
      {}, 
      { $set: { rating: 0, ratings: [] } }
    )
    
    // Clear all user ratings arrays
    const updatedUsers = await User.updateMany(
      {},
      { $set: { ratings: [] } }
    )
    
    return res.json({
      message: 'All ratings deleted and shoe ratings reset to 0', 
      deletedRatingsCount: deletedRatings.deletedCount,
      modifiedShoesCount: updatedShoes.modifiedCount,
      modifiedUsersCount: updatedUsers.modifiedCount
    })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset ratings and shoes' })
  }
})


module.exports = router;