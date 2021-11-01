export {}
import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')
const Shoe = require('../models/Shoe')
const { getShoesFromBrand, getShoesFromAllBrands } = require('../utils/sneakerV2_API')

const router = express.Router()

router.get('/', async (req: Request, res: Response) => {
  const allShoes = await Shoe.find({}).sort({'date': 1}).limit(10)
  res.json(allShoes)
})

router.get('/:shoeID', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({shoeID: req.params.shoeID})
  res.json(shoe)
})

router.get('/:shoeID', async (req: Request, res: Response) => {
  const shoe = await Shoe.findOne({shoeID: req.params.shoeID})
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