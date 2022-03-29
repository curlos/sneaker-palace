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
    <div className="fixed z-20 max-w-100 w-screen h-screen bg-black bg-opacity-40 p-24 top-0 left-0 flex justify-center items-center" onClick={() => setShowModal(!showModal)}>
      <form className="w-1/2 h-10/12 bg-white rounded-3xl p-12 placeholder-gray-400">
        <div className="flex justify-between text-lg">
          <div>Edit password</div>
          <XIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => setShowModal(false)} />
        </div>
        <div className="text-gray-400">Current Password*</div>
        <input type="text" className="w-full rounded-lg mb-4 placeholder-gray-400" placeholder="Current Password*" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} onClick={handleBubblingDownClick}></input>
        <div className="text-gray-400">New Password*</div>
        <input type="text" className="w-full rounded-lg mb-4 placeholder-gray-400" placeholder="New Password*" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} onClick={handleBubblingDownClick}></input>

        <div className="text-gray-400">Confirm New Password*</div>
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