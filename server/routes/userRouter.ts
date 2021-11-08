import { Request, Response } from 'express'

const User = require('../models/User')

const router = require('express').Router()

router.get('/:userID', async (req: Request, res: Response) => {
  const user = await User.findById(req.params.userID)
  res.json(user)
})


module.exports = router;