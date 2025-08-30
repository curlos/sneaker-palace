import { Request, Response } from 'express'

const Cart = require('../models/Cart')
const { verifyToken } = require('./verifyToken')

const router = require('express').Router()

// Create cart
router.post('/', verifyToken, async (req: Request, res: Response) => {
  const newCart = new Cart({
    userID: req.user.id,
    products: []
  })

  const savedCart = await newCart.save()
  return res.json(savedCart)
})

// Update cart
router.put('/', verifyToken, async (req: Request, res: Response) => {
  const updatedCart = await Cart.findOneAndUpdate(
    { userID: req.user.id },
    {
      $set: req.body,
    },
    { new: true }
  )

  if (!updatedCart) {
    return res.status(404).json({ error: 'Cart not found' })
  }

  return res.status(200).json(updatedCart)
})

// Get user's cart
router.get('/', verifyToken, async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ userID: req.user.id })
  return res.status(200).json(cart)
})

module.exports = router;