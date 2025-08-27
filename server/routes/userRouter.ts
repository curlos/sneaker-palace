import { Request, Response } from 'express'
import { UserType } from '../types/types'

declare module 'express-serve-static-core' {
  interface Request {
    user?: any
  }
}

const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
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

// TODO: Add auth.
router.put('/:userID', async (req: Request, res: Response) => {
  // Remove password from body - passwords should only be changed via dedicated password endpoint.
  const { password, ...updateData } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userID,
      {
        $set: updateData,
      },
      { new: true }
    )

    return res.status(200).json(updatedUser);
  } catch (err) {

    return res.json({ error: err });
  }
})

// TODO: Add auth.
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

    // Verify current password using bcrypt (all passwords should be bcrypt after auto-upgrade)
    const isValidCurrentPassword = await bcrypt.compare(req.body.currentPassword, user.password)

    if (!isValidCurrentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password with bcrypt
    const newPasswordHash = await bcrypt.hash(req.body.newPassword, 12)
    const newPassword = {
      password: newPasswordHash,
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