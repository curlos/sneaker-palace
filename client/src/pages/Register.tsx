import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

const Register = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const history = useHistory()

  useEffect(() => {
    window.scrollTo(0, 0)
  })

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault()

    const body = {
      email,
      password,
      firstName,
      lastName,
    }
    console.log(body)
    try {
      const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/auth/register`, body)
      console.log(response.data)
      history.push('/')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <form className="h-screen bg-login-image bg-cover flex justify-center items-start" onSubmit={handleRegisterUser}>
      <div className="flex flex-col gap-4 items-center bg-white w-2/5 p-4 rounded-lg my-6">
        <span className="font-bold text-2xl">BECOME A MEMBER</span>
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-gray-300 rounded-lg p-2 px-4 w-full focus:outline-none"></input>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="border border-gray-300 rounded-lg p-2 px-4 w-full focus:outline-none"></input>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border border-gray-300 rounded-lg p-2 px-4 w-full focus:outline-none"></input>
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border border-gray-300 rounded-lg p-2 px-4 w-full focus:outline-none"></input>

        <button className="bg-black text-white w-full py-2 rounded-lg hover:bg-gray-600" onClick={handleRegisterUser}>SIGN UP</button>
        <span className="text-gray-500">Already a member? <Link to="/login" className="text-black underline">Log in.</Link></span>
      </div>
    </form>
  )
}

export default Register
