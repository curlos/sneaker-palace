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
    const currUser = await User.findOne({_id: req.params.userID})

    console.log(userFound._id, currUser._id)

    if (userFound && String(userFound._id) !== String(currUser._id)) {
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

  updatedInfo = {
    ...updatedInfo,
    lowerCaseEmail: updatedInfo.email.toLowerCase()
  }

  const updatedUser = await User.findOneAndUpdate(req.params.id, 
    { $set: updatedInfo }, 
    { new: true })

  console.log(updatedUser)
  res.json(updatedUser)
})




module.exports = router;