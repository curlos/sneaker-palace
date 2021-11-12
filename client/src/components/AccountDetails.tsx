import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { UserType } from '../types/types'

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const postImage = async (image: File) => {
  const formData = new FormData()
  formData.append('image', image)

  const response = await axios.post('http://localhost:8888/images', formData, { headers: {'Content-Type': 'multipart/form-data'}})
  return response.data
}

const AccountDetails = () => {

  const dispatch = useDispatch()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)

  const [profilePic, setProfilePic] = useState(user?.profilePic)
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [email, setEmail] = useState(user?.email)
  const [password, setPassword] = useState('***********')

  const [file, setFile] = useState<File>()

  const handleEdit = async () => {
    let profilePicObj = null

    if (file) {
      const results = await postImage(file)
      console.log(results)
      profilePicObj = results.imagePath
    }

    const body = {
      firstName,
      lastName,
      email,
      password,
      profilePic: profilePicObj
    }

    console.log(body)

    const response = await axios.put(`http://localhost:8888/users/${user._id}`, body)
    console.log(response.data)
    
    if (!response.data.error) {
      dispatch(updateUser(response.data))
    }
  }

  const handleSelectFile = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0]
    setFile(file)
  }

  console.log(file)

  return (
    <div className="w-1/2">
      <div className="text-2xl font-medium mb-4">Account Details</div>

      <form>
        <div className="mb-4">
        {(file || profilePic) && (
          <img src={file ? URL.createObjectURL(file) : `http://localhost:8888${profilePic}` } alt="" className="h-150 w-150 rounded-full object-cover mb-3"/>
        )}

          <input onChange={handleSelectFile} type="file" accept="image/*"></input>
        </div>

        <div className="mb-4">
          <div className="mb-1">First Name</div>
          <input type="text" placeholder="Email" className="rounded-lg w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
        </div>

        <div className="mb-4">
          <div className="mb-1">Last Name</div>
          <input type="text" placeholder="Last Name" className="rounded-lg w-full" value={lastName} onChange={(e) => setLastName(e.target.value)}/>
        </div>

        <div className="mb-4">
          <div className="mb-1">Email</div>
          <input type="text" placeholder="Email" className="rounded-lg w-full" value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>

        <div className="mb-4">
          <div className="mb-1">Password</div>
          <input type="password" placeholder="Password" className="rounded-lg w-full" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
      </form>

      <div className="flex justify-end">
        <button onClick={handleEdit} className="rounded-full bg-gray-300 text-gray-500 px-5 py-3 hover:text-gray-700">Save</button>
      </div>
    </div>
  )
}

export default AccountDetails
