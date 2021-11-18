import { Request, Response } from 'express'
import { uploadFile, getFileStream } from '../aws/s3'

const express = require('express')
const mongoose = require('mongoose')

const fs = require('fs')
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const router = express.Router()

router.get('/:key', async (req: Request, res: Response) => {
  const key = req.params.key
  const readStream = getFileStream(key)

  console.log(readStream)

  readStream.pipe(res)
})

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  const file = req.file
  console.log(file)
  const response = await uploadFile(file)

  if (file) {
    await unlinkFile(file.path)
  }

  console.log(response)
  res.send({ imagePath: `/images/${response.Key}` })
})

module.exports = router;