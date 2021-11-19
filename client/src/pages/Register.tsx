import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

const Register = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('All fields must be filled out!')
  const history = useHistory()

  useEffect(() => {
    window.scrollTo(0, 0)
  })

  const handleRegisterUser = async (e: React.FormEvent) => {
    setError(false)
    setErrorMessage('All fields must be filled out!')
    e.preventDefault()

    const body = {
      email,
      password,
      firstName,
      lastName,
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/auth/register`, body)

      if (response.data.error) {
        setError(true)
        setErrorMessage(response.data.error)


      } else {
        history.push('/')
      }
    } catch (err) {
      setError(true)

    }
  }

  return (
    <form className="h-screen bg-login-image bg-cover flex justify-center items-start" onSubmit={handleRegisterUser}>
      <div className="flex flex-col gap-4 items-center bg-white w-2/5 p-4 rounded-lg my-6 xl:w-4/5 xl:py-10 sm:w-97/100">
        <span className="font-bold text-2xl">BECOME A MEMBER</span>
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={`rounded-lg p-2 px-4 w-full focus:outline-none ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}></input>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`rounded-lg p-2 px-4 w-full focus:outline-none ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}></input>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={`rounded-lg p-2 px-4 w-full focus:outline-none ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}></input>
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={`rounded-lg p-2 px-4 w-full focus:outline-none ${error ? 'border-red-600 border-2' : 'border border-gray-300'}`}></input>

        {error ? <span className="text-red-600">{errorMessage}</span> : null}

        <button className="bg-black text-white w-full py-2 rounded-lg hover:bg-gray-600" onClick={handleRegisterUser}>SIGN UP</button>
        <span className="text-gray-500">Already a member? <Link to="/login" className="text-black underline">Log in.</Link></span>
      </div>
    </form>
  )
}

export default Register
