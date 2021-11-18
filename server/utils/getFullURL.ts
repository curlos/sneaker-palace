import { Request, Response } from 'express'

const url = require('url');

export const getFullURL = (req: Request) => {
  return url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: req.originalUrl
  });
}