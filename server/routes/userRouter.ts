import { Request, Response } from 'express'

const User = require('../models/User')
const CryptoJS = require('crypto-js')
const router = require('express').Router()

router.get('/:userID', async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userID)
  return res.json(user)
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