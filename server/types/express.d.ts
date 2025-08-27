import { UserType } from './types'

declare global {
  namespace Express {
    interface Request {
      user?: UserType
      order?: any
    }
  }
}

export {}