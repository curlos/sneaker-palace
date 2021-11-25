import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')
const queryString = require('query-string');
const Shoe = require('../models/Shoe')
const User = require('../models/User')
const { getFullURL } = require('../utils/getFullURL')
const { addAllShoes, addAllShoesByBrand, addShoeByName } = require('../utils/sneakerV2_API')


const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  const allShoes = await Shoe.find({})
    .select('shoeID image.original name gender colorway ratings retailPrice brand rating')
    .lean().exec((err: any, results: any) => {
      res.json(results)
    })
})

router.get('/:shoeID', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({ shoeID: req.params.shoeID })
  res.json(shoe)
})










router.get('/objectID/:id', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({ _id: req.params.id })
  res.json(shoe)
})

router.get('/query/:queryString', async (req: Request, res: Response) => {
  const shoes = await Shoe
    .find({ "name": { "$regex": req.params.queryString.trim(), "$options": "i" } }).lean()
  res.json(shoes)
})

router.put('/favorite', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({ shoeID: req.body.shoeID })
  const user = await User.findOne({ _id: req.body.userID })

  if (!shoe.favorites.includes(req.body.userID)) {
    await shoe.updateOne({ $push: { favorites: user._id } })
    await user.updateOne({ $push: { favorites: shoe._id } })
    const updatedShoe = await Shoe.findById(shoe._id)
    const updatedUser = await User.findById(user._id)
    res.status(200).json({ updatedShoe, updatedUser })
  } else {
    await shoe.updateOne({ $pull: { favorites: user._id } })
    await user.updateOne({ $pull: { favorites: shoe._id } })
    const updatedShoe = await Shoe.findById(shoe._id)
    const updatedUser = await User.findById(user._id)
    res.status(200).json({ updatedShoe, updatedUser })
  }
  res.json(shoe)
})











router.post('/newShoes', async (req: Request, res: Response) => {
  const result = await addAllShoes(Number(req.body.page), Number(req.body.releaseYear))
  res.json(result)
})

router.post('/newShoes/brand', async (req: Request, res: Response) => {
  const result = await addAllShoesByBrand(req.body.brand)
  res.json(result)
})

router.post('/newShoe', async (req: Request, res: Response) => {
  const result = await addShoeByName(req.body.name)
  res.json(result)
})

router.post('/delete', async (req: Request, res: Response) => {
  const result = await Shoe.deleteMany({ brand: { $in: ['Louis Vuitton'] } })
  res.json(result)
})

module.exports = router;