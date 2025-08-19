import axios from 'axios'
import React, { ChangeEvent, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { UserType } from '../types/types'
import { postImage } from '../utils/postImage'
import FailureMessage from './FailureMessage'
import NewPasswordModal from './NewPasswordModal'
import SuccessMessage from './SuccessMessage'

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'



const AccountDetails = () => {

  const dispatch = useDispatch()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [email, setEmail] = useState(user?.email)
  const [file, setFile] = useState<File>()

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showFailureMessage, setShowFailureMessage] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleEdit = async () => {
    let profilePicObj = user?.profilePic

    if (file) {
      const results = await postImage(file)

      profilePicObj = results.imagePath
    }

    const body = {
      firstName,
      lastName,
      email,
      profilePic: profilePicObj
    }



    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/users/${user._id}`, body)


    if (!response.data.error) {
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false) }, 3000)

      dispatch(updateUser(response.data))
    } else {
      setShowFailureMessage(true)
      setTimeout(() => { setShowFailureMessage(false) }, 3000)
    }
  }

  const handleSelectFile = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0]
    setFile(file)
  }



  return (
    <div className="w-1/2 sm:w-full sm:mt-8">
      <div className="text-2xl font-medium mb-4">Account Details</div>

      <form>
        <div className="mb-4">
          {(file || user?.profilePic) ? (
            <img src={file ? URL.createObjectURL(file) : `${process.env.REACT_APP_DEV_URL}${user?.profilePic}`} alt="" className="h-150 w-150 rounded-full object-cover mb-3" />
          ) :
            <img src={DEFAULT_AVATAR} alt="" className="h-150 w-150 rounded-full object-cover mb-3" />
          }

          <input onChange={handleSelectFile} type="file" accept="image/*"></input>
        </div>

        <div className="mb-4">
          <div className="mb-1">First Name</div>
          <input type="text" placeholder="Email" className="rounded-lg w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>

        <div className="mb-4">
          <div className="mb-1">Last Name</div>
          <input type="text" placeholder="Last Name" className="rounded-lg w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="mb-4">
          <div className="mb-1">Email</div>
          <input type="text" placeholder="Email" className="rounded-lg w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-4">
          <div className="mb-1">Password</div>
          <input type="password" placeholder="Password" className="rounded-lg w-full cursor-pointer" value={'*********'} onClick={() => setShowModal(true)} readOnly />
        </div>
      </form>

      {showSuccessMessage ? <SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} /> : null}
      {showFailureMessage ? <FailureMessage setShowMessage={setShowFailureMessage} message={'Settings not updated, error occured!'} /> : null}

      <div className="flex justify-end">
        <button onClick={handleEdit} className="rounded-full bg-gray-300 text-gray-500 px-5 py-3 hover:text-gray-700">Save</button>
      </div>

      {showModal ? <NewPasswordModal showModal={showModal} setShowModal={setShowModal} /> : null}
    </div>
  )
}

export default AccountDetails
