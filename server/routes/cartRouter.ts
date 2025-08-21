import { Request, Response } from 'express'

const User = require('../models/User')
const Shoe = require('../models/Shoe')
const Cart = require('../models/Cart')

const router = require('express').Router()

// Create cart
router.post('/:userID', async (req: Request, res: Response) => {
  const newCart = new Cart({
    userID: req.params.userID,
    products: []
  })

  const savedCart = await newCart.save()
  return res.json(savedCart)
})

// Update cart
router.put('/:id', async (req: Request, res: Response) => {
  const updatedCart = await Cart.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )


  return res.status(200).json(updatedCart)
})

// Update specific product in cart 
router.put('/:id', async (req: Request, res: Response) => {
  const updatedCart = await Cart.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    { new: true }
  )
  return res.status(200).json(updatedCart)
})


// Get user's cart
router.get('/find/:userID', async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ userID: req.params.userID })
  return res.status(200).json(cart)
})

// Delete 
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await Cart.findByIdAndDelete(req.params.id)
    return res.status(200).json('Cart has been deleted...')
  } catch (err) {
    return res.status(500).json(err)
  }
})


module.exports = router;