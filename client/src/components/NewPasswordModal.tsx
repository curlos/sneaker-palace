import { XIcon } from '@heroicons/react/outline'
import axios from 'axios'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { UserType } from '../types/types'
import FailureMessage from './FailureMessage'
import SuccessMessage from './SuccessMessage'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

const NewPasswordModal = ({ showModal, setShowModal }: Props) => {

  const dispatch = useDispatch()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showFailureMessage, setShowFailureMessage] = useState(false)

  const handleBubblingDownClick = (e: React.FormEvent) => {
    e.stopPropagation()
  }

  const handleEditPassword = async () => {

    const body = {
      currentPassword,
      newPassword
    }

    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/users/password/${user._id}`, body)

    if (!response.data.error) {
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false) }, 3000)
      dispatch(updateUser(response.data))
    } else {
      setShowFailureMessage(true)
      setTimeout(() => { setShowFailureMessage(false) }, 3000)
    }
  }

  return (
    <div className="fixed z-20 w-screen h-screen bg-black bg-opacity-40 p-0 sm:p-8 md:p-16 lg:p-24 top-0 left-0 flex justify-center items-center" onClick={() => setShowModal(!showModal)}>
      <form className="w-full sm:w-full md:w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 max-w-none lg:max-w-lg max-h-screen md:h-auto lg:h-4/5 xl:h-3/5 mx-0 sm:mx-0 lg:mx-8 xl:mx-auto bg-white rounded-lg md:rounded-2xl lg:rounded-3xl p-3 md:p-6 lg:p-8 xl:p-12 placeholder-gray-400 overflow-y-auto" onClick={handleBubblingDownClick}>
        <div className="flex justify-between text-lg mb-4">
          <div className="font-bold">Edit Password</div>
          <XIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => setShowModal(false)} />
        </div>
        <div>Current Password*</div>
        <input type="text" className="w-full rounded-lg mb-4 placeholder-gray-400" placeholder="Current Password*" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} onClick={handleBubblingDownClick}></input>
        <div>New Password*</div>
        <input type="text" className="w-full rounded-lg mb-4 placeholder-gray-400" placeholder="New Password*" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} onClick={handleBubblingDownClick}></input>

        <div>Confirm New Password*</div>
        <input type="text" className="w-full rounded-lg mb-4 placeholder-gray-400" placeholder="Confirm New Password*" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} onClick={handleBubblingDownClick}></input>

        {showSuccessMessage ? <SuccessMessage setShowMessage={setShowSuccessMessage} message={'Settings updated!'} /> : null}
        {showFailureMessage ? <FailureMessage setShowMessage={setShowFailureMessage} message={'Settings not updated, error occured!'} /> : null}

        <div className="flex justify-end">
          <button onClick={handleEditPassword} className="rounded-full bg-gray-300 text-gray-500 px-5 py-3 hover:text-gray-700">Save</button>
        </div>
      </form>
    </div>
  )
}

export default NewPasswordModal