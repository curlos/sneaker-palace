const express = require('express')
const mongoose = require('mongoose')
const Shoe = require('../models/Shoe')

const router = express.Router()

router.get('/', async (req, res) => {
  const allShoes = await Shoe.find({})
  res.json(allShoes)
})

router.get('/:shoeID', async (req, res) => {
  const shoe = await Shoe.findOne({shoeID: req.params.shoeID})
  res.json(shoe)
})

router.get('/:shoeID', async (req, res) => {
  const shoe = await Shoe.findOne({shoeID: req.params.shoeID})
  res.json(shoe)
})

module.exports = router;