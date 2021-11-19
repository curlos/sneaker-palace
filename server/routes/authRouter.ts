import { Request, Response } from 'express'

const router = require('express').Router()
const User = require('../models/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

// Register User
router.post('/register', async (req: Request, res: Response) => {

  const foundUser = await User.findOne({ lowerCaseEmail: req.body.email.toLowerCase() })

  if (foundUser) {
    res.json({ error: 'Email taken' })
  } else {
    const newUser = new User({
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      lowerCaseEmail: req.body.email
    })

    try {
      const savedUser = await newUser.save()
      res.status(201).json(savedUser)
    } catch (err) {
      res.status(500).json(err)
    }
  }
})

// Login User

router.post('/login', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      res.status(401).json('Wrong credentials')
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    )

    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)

    originalPassword !== req.body.password && res.status(401).json('Wrong credentials')

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    )

    const { password, ...others } = user._doc

    res.status(200).json({ ...others, accessToken })
  } catch (err) {
    res.status(500).json(err)
  }
})

module.exports = router