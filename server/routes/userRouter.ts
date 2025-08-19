import { Request, Response } from 'express'

const User = require('../models/User')
const CryptoJS = require('crypto-js')
const router = require('express').Router()

router.get('/:userID', async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userID)
  res.json(user)
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

    res.status(200).json(updatedUser);
  } catch (err) {

    res.json({ error: err });
  }
})

router.put('/password/:userID', async (req: Request, res: Response) => {
  const user = await User.findOne({ _id: req.params.userID })



  const hashedPassword = CryptoJS.AES.decrypt(
    user.password,
    process.env.PASS_SEC
  )

  const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8)

  if (originalPassword !== req.body.currentPassword) {
    return res.json({ err: 'Wrong credentials' })
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

  res.status(200).json(updatedUser);
})




module.exports = router;