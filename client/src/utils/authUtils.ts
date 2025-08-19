import axios from 'axios'
import { Dispatch } from '@reduxjs/toolkit'
import { updateCart } from '../redux/cartRedux'
import { loginStart, loginSuccess } from '../redux/userRedux'
import { UserType } from '../types/types'

export const fetchUserCart = async (loggedInUser: UserType) => {
  const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/cart/find/${loggedInUser._id}`)

  // If user doesn't have a cart, create one
  if (!response.data) {
    const createCartResponse = await axios.post(`${process.env.REACT_APP_DEV_URL}/cart/${loggedInUser._id}`)
    return createCartResponse.data
  }

  return response.data
}

export const performLogin = async (
  email: string, 
  password: string, 
  dispatch: Dispatch
): Promise<UserType> => {
  dispatch(loginStart())
  
  const body = { email, password }
  const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/auth/login`, body)
  
  if (!response.data) {
    throw new Error('Login failed')
  }
  
  dispatch(loginSuccess(response.data))
  const userCart = await fetchUserCart(response.data)
  dispatch(updateCart(userCart))
  
  return response.data
}