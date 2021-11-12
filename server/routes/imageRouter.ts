export {}
import { Request, Response } from 'express'

const express = require('express')
const mongoose = require('mongoose')

const multer = require('multer')
const upload = multer({ dest: 'uploads/'})

const router = express.Router()

router.post('/', upload.single('image'),  async (req: Request, res: Response) => {
  const file = req.file
  console.log(file)
  const description = req.body.description
  res.send("ok")
})

module.exports = router;