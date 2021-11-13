import { SearchIcon, XIcon } from '@heroicons/react/outline'
import axios from 'axios'
import moment from 'moment'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import StarRatingComponent from 'react-star-rating-component'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { IRating, UserType } from '../types/types'
import FailureMessage from './FailureMessage'
import SmallProductList from './SmallProductList'
import SuccessMessage from './SuccessMessage'

interface Props {
  showModal: boolean,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
  review: IRating
}

const ReviewModal = ({ showModal, setShowModal, review}: Props) => {

  const dispatch = useDispatch()
  const history = useHistory()
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

    console.log(body)

    const response = await axios.put(`http://localhost:8888/users/password/${user._id}`, body)
    console.log(response.data)
    
    if (!response.data.error) {
      setShowSuccessMessage(true)
      setTimeout(() => {setShowSuccessMessage(false)}, 3000)
      dispatch(updateUser(response.data))
    } else {
      setShowFailureMessage(true)
      setTimeout(() => {setShowFailureMessage(false)}, 3000)
    }
  }

  return (
    <div className="fixed z-20 w-screen h-screen bg-black bg-opacity-40 p-24 top-0 left-0 flex justify-center items-center" onClick={() => setShowModal(!showModal)}>
      <div className="w-3/4 h-10/12 placeholder-gray-400">

        <div className="w-full flex justify-end rounded-t-2xl bg-gray-300 border-0 border-b border-solid border-gray-400 p-3">
          <XIcon className="h-6 w-6 cursor-pointer" onClick={() => setShowModal(false)}/>
        </div>
        
        <div className="overflow-y bg-white">
          <div className="p-3 flex">
            <div className="flex-2">
              <img src={`http://localhost:8888${review.photo}`} alt="" className="mr-4" />
            </div>

            <div className="flex-2 ml-4">
              <div className="flex">
                <StarRatingComponent
                  name={'Rating'}
                  value={review.ratingNum}
                  starCount={5}
                  editing={false}
                  starColor={'#F5B327'}
                />

                <div className="ml-2 font-bold">{review.summary}</div>
              </div>

              <div className="flex-2">
                <div className="text-sm text-gray-600">By {review.postedByUser.firstName} {review.postedByUser.lastName} on {moment(review.createdAt).format('MMMM Do, YYYY')}</div>

                <div>{review.text}</div>
              </div>

            </div>
          </div>
        </div>

        <div className="w-full flex justify-end rounded-b-2xl bg-white p-3 h-7">
          
        </div>
      </div>
    </div>
  )
}

export default ReviewModal