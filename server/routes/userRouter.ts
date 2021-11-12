import { Request, Response } from 'express'

const User = require('../models/User')
const CryptoJS = require('crypto-js')
const router = require('express').Router()

router.get('/:userID', async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userID)
  res.json(user)
})

router.put('/:userID', async (req: Request, res: Response) => {
  if (req.body.email) {
    const userFound = await User.findOne({email: req.body.email})

    if (userFound && userFound._id !== req.params.userID) {
      res.json({error: 'Email already in use'})
      return
    }
  }

  const { password, ...others } = req.body
  let updatedInfo = req.body

  if (password) {
    updatedInfo = {
      ...others,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString()
    }
  }

  const updatedUser = await User.findOneAndUpdate(req.params.id, 
    { $set: updatedInfo }, 
    { new: true })

  console.log(updatedUser)
  res.json(updatedUser)
})




module.exports = router;