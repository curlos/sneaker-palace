import { Request, Response } from 'express'
import { UserType } from '../types/types'

declare module 'express-serve-static-core' {
  interface Request {
    user?: any
  }
}

const User = require('../models/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')
const router = require('express').Router()

const optionalAuth = (req: Request, _res: Response, next: any) => {
  const authHeader: any = req.headers.token
  
  if (authHeader) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SEC, (err: any, user: UserType) => {
      if (!err) {
        req.user = user
      }
      next()
    })
  } else {
    next()
  }
}

router.get('/:userID', optionalAuth, async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userID)
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  
  const isOwnProfile = req.user && req.user.id === req.params.userID
  
  if (isOwnProfile) {
    const { password, ...userWithoutPassword } = user._doc
    return res.json(userWithoutPassword)
  } else {
    const { password, email, lowerCaseEmail, isAdmin, orders, ...publicProfile } = user._doc
    return res.json(publicProfile)
  }
})

router.put('/:userID', async (req: Request, res: Response) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userID,
      {
        $set: req.body,
      },
      { new: true }
    )

    return res.status(200).json(updatedUser);
  } catch (err) {

    return res.json({ error: err });
  }
})

router.put('/password/:userID', async (req: Request, res: Response) => {
  try {
    // Basic validation
    if (!req.body.currentPassword || !req.body.newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (req.body.newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' })
    }

    const user = await User.findOne({ _id: req.params.userID })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    )

    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)

    if (originalPassword !== req.body.currentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    const newPassword = {
      password: CryptoJS.AES.encrypt(
        req.body.newPassword,
        process.env.PASS_SEC
      ).toString(),
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userID,
      {
        $set: newPassword,
      },
      { new: true }
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router;