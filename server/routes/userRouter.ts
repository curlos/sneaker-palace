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
const { verifyToken } = require('./verifyToken')

const optionalAuth = (req: Request, _res: Response, next: any) => {
  const authHeader: any = req.headers.authorization
  
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

router.put('/', verifyToken, async (req: Request, res: Response) => {
  // Remove password from body - passwords should only be changed via dedicated password endpoint.
  const { password, ...updateData } = req.body;

  try {
    // If email is being updated, check if it's different and unique
    if (updateData.email) {
      const currentUser = await User.findById(req.user.id)
      
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Check if the new email is different from current email
      if (updateData.email !== currentUser.email) {
        // Check if the new email already exists in the database
        const existingUser = await User.findOne({ email: updateData.email })
        
        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' })
        }

        // Also update lowerCaseEmail if it exists in the schema
        if (updateData.email) {
          updateData.lowerCaseEmail = updateData.email.toLowerCase()
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: updateData,
      },
      { new: true }
    )

    const { password, ...userWithoutPassword } = updatedUser._doc;
    return res.status(200).json({ message: 'User updated successfully', user: userWithoutPassword });
  } catch (err) {

    return res.json({ error: err });
  }
})

router.put('/password', verifyToken, async (req: Request, res: Response) => {
  try {
    // Basic validation
    if (!req.body.currentPassword || !req.body.newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (req.body.newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' })
    }

    const user = await User.findOne({ _id: req.user.id })

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
      req.user.id,
      {
        $set: newPassword,
      },
      { new: true }
    );

    const { password, ...userWithoutPassword } = updatedUser._doc;
    return res.status(200).json({ message: 'Password updated successfully', user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
})

module.exports = router;