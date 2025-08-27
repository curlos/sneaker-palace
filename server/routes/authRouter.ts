import { Request, Response } from 'express'

const router = require('express').Router()
const User = require('../models/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// Register User
router.post('/register', async (req: Request, res: Response) => {
  // Basic validation
  if (!req.body.firstName || req.body.firstName.trim().length === 0) {
    return res.status(400).json({ error: 'First name is required' })
  }

  if (!req.body.password) {
    return res.status(400).json({ error: 'Password is required' })
  }

  if (req.body.password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' })
  }

  const foundUser = await User.findOne({ lowerCaseEmail: req.body.email.toLowerCase() })

  if (foundUser) {
    return res.status(400).json({ error: 'Email taken' })
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 12)
    
    const newUser = new User({
      email: req.body.email,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      lowerCaseEmail: req.body.email
    })

    try {
      const savedUser = await newUser.save()
      return res.status(201).json(savedUser)
    } catch (err) {
      return res.status(500).json(err)
    }
  }
})

// Login User
router.post('/login', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
      return res.status(401).json('Wrong credentials')
    }

    let isValidPassword = false
    let requiresPasswordUpdate = false

    // Check if it's a bcrypt hash (new format) - supports $2a$, $2b$, $2x$, $2y$
    if (/^\$2[abxy]\$/.test(user.password)) {
      isValidPassword = await bcrypt.compare(req.body.password, user.password)
    } else {
      // Legacy AES encrypted password
      try {
        const hashedPassword = CryptoJS.AES.decrypt(
          user.password,
          process.env.PASS_SEC
        )
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)
        
        if (originalPassword === req.body.password) {
          isValidPassword = true
          requiresPasswordUpdate = true
        }
      } catch (err) {
        isValidPassword = false
      }
    }

    if (!isValidPassword) {
      return res.status(401).json('Wrong credentials')
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    )

    const { password, ...others } = user._doc

    return res.status(200).json({ 
      ...others, 
      accessToken,
      requiresPasswordUpdate
    })
  } catch (err) {
    return res.status(500).json(err)
  }
})

module.exports = router