import { Request, Response } from 'express'

const Cart = require('../models/Cart')

const router = require('express').Router()

// TODO: Add auth.
// Create cart
router.post('/:userID', async (req: Request, res: Response) => {
  const newCart = new Cart({
    userID: req.params.userID,
    products: []
  })

  const savedCart = await newCart.save()
  return res.json(savedCart)
})

// TODO: Add auth.
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

// TODO: Add auth.
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

// TODO: Add auth.
// Get user's cart
router.get('/find/:userID', async (req: Request, res: Response) => {
  const cart = await Cart.findOne({ userID: req.params.userID })
  return res.status(200).json(cart)
})

// TODO: Add auth.
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