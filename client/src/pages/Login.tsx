import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { updateCart } from '../redux/cartRedux'
import { loginFailure, loginStart, loginSuccess } from '../redux/userRedux'
import { UserType } from '../types/types'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    window.scrollTo(0, 0)
  })

  const handleLoginUser = async (e: React.FormEvent) => {
    setError(false)
    e.preventDefault()

    const body = {
      email,
      password,
    }


    try {
      dispatch(loginStart())
      const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/auth/login`, body)

      if (response.data) {
        dispatch(loginSuccess(response.data))
        const userCart = await fetchUserCart(response.data)

        dispatch(updateCart(userCart))
        history.push('/')
      }

    } catch (err) {

      setError(true)
      dispatch(loginFailure())
    }
  }

  const fetchUserCart = async (loggedInUser: UserType) => {
    const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/cart/find/${loggedInUser._id}`)

    // If user doesn't have a cart, create one
    if (!response.data) {
      const createCartResponse = await axios.post(`${process.env.REACT_APP_DEV_URL}/cart/${loggedInUser._id}`)
      return createCartResponse.data
    }

    return response.data
  }

  return (
    <form className="h-screen bg-login-image bg-cover flex justify-center items-start" onSubmit={handleLoginUser}>
      <div className="flex flex-col gap-4 items-center bg-white w-2/5 p-4 rounded-lg my-6 xl:w-4/5 xl:py-10 sm:w-97/100">
        <span className="font-bold text-2xl">YOUR ACCOUNT FOR EVERYTHING</span>
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`rounded-lg p-2 px-4 w-full focus:outline-none ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}></input>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`rounded-lg p-2 px-4 w-full focus:outline-none ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}></input>

        <button className="bg-black text-white w-full py-2 rounded-lg hover:bg-gray-600" onClick={handleLoginUser}>SIGN IN</button>
        {error ? <span className="text-red-600">Invalid credentials!</span> : null}
        <span className="text-gray-500">Not a member? <Link to="/register" className="text-black underline">Sign up.</Link></span>
      </div>
    </form>
  )
}

export default Login
