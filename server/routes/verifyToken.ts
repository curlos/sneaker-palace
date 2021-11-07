import { Request, Response } from 'express'
import { UserType } from '../types/types'

const jwt = require('jsonwebtoken')

const verifyToken = (req: Request, res: Response, next: any) => {
  const authHeader: any = req.headers.token

  if (authHeader) {
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_SEC, (err: any, user: UserType) => {
      if (err) res.status(403).json('Token is not valid!')

      req.user = user
      next()
    })
  } else {
    return res.status(401).json('You are not authenticated!')
  }
}

const verifyTokenAndAuthorization = (req: Request, res: Response, next: any) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next()
    } else {
      res.status(403).json('You are not allowed to do that')
    }
  })
}

const verifyTokenAndAdmin = (req: Request, res: Response, next: any) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next()
    } else {
      res.status(403).json('You are not allowed to do that!')
    }
  })
}

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin
}