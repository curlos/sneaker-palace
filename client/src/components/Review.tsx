import { PencilAltIcon, ThumbDownIcon as ThumbDownOutline, ThumbUpIcon as ThumbUpOutline, TrashIcon } from '@heroicons/react/outline'
import { ThumbDownIcon as ThumbDownSolid, ThumbUpIcon as ThumbUpSolid } from '@heroicons/react/solid'
import axios from 'axios'
import moment from 'moment'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import StarRatingComponent from 'react-star-rating-component'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { IRating, Shoe, UserType } from '../types/types'
import ReviewModal from './ReviewModal'

interface Props {
  shoeRating: IRating,
  shoeRatings: Array<IRating>,
  setShoeRatings: React.Dispatch<React.SetStateAction<Array<IRating>>>,
  shoe: Partial<Shoe>
}

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const Review = ({ shoeRating, shoeRatings, setShoeRatings, shoe }: Props) => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const dispatch = useDispatch()
  const [review, setReview] = useState(shoeRating)
  const [showModal, setShowModal] = useState(false)

  const handleLike = async () => {
    const body = {
      ratingID: review._id,
      userID: user._id
    }
    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/rating/like`, body)

    setReview({ ...review, helpful: response.data.updatedRating.helpful, notHelpful: response.data.updatedRating.notHelpful })
    dispatch(updateUser(response.data.updatedUser))

  }

  const handleDislike = async () => {
    const body = {
      ratingID: review._id,
      userID: user._id
    }
    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/rating/dislike`, body)

    setReview({ ...review, notHelpful: response.data.updatedRating.notHelpful, helpful: response.data.updatedRating.helpful, })
    dispatch(updateUser(response.data.updatedUser))
  }

  const handleDeleteReview = async () => {

    await axios.delete(`${process.env.REACT_APP_DEV_URL}/rating/${review._id}`)

    setShoeRatings(shoeRatings.filter((shoeRating) => shoeRating._id !== review._id))
  }



  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <img src={review.postedByUser.profilePic ? `${process.env.REACT_APP_DEV_URL}${review.postedByUser.profilePic}` : DEFAULT_AVATAR} alt={review.postedByUser.firstName} className="h-9 w-9 rounded-full object-cover" />

          <div className="text-sm">{review.postedByUser.firstName} {review.postedByUser.lastName}</div>
        </div>

        {review.postedByUser._id === user._id ? (
          <div className="flex gap-2">
            <Link to={`/shoe/edit-review/${shoe.shoeID}/${review._id}`}>
              <PencilAltIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
            </Link>

            <TrashIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={handleDeleteReview} />
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex sm:block">
        <StarRatingComponent
          name={'Rating'}
          value={review.ratingNum}
          starCount={5}
          editing={false}
          starColor={'#F5B327'}
        />
        <div className="ml-2 font-bold sm:ml-0">{review.summary}</div>
      </div>

      <div className="text-sm text-gray-600">Reviewed on {moment(review.createdAt).format('MMMM Do, YYYY')}</div>
      <div className="text-sm font-medium text-orange-700">Verified Purchase</div>
      <div className="text-sm my-2">{review.text}</div>

      {review.photo ? <img src={`${process.env.REACT_APP_DEV_URL}${review.photo}`} alt="" className="h-36 object-cover my-2 cursor-pointer" onClick={() => setShowModal(true)} /> : null}

      <div className="text-sm flex gap-2">
        <div>Helpful? </div>
        <div className="flex">
          {user.helpful?.includes(review._id) ? <ThumbUpSolid className="h-5 w-5 cursor-pointer" onClick={handleLike} /> : <ThumbUpOutline className="h-5 w-5 cursor-pointer" onClick={handleLike} />}
          <span className="ml-1">{review.helpful.length}</span>
        </div>
        <div className="flex">
          {user.notHelpful?.includes(review._id) ? <ThumbDownSolid className="h-5 w-5 cursor-pointer" onClick={handleDislike} /> : <ThumbDownOutline className="h-5 w-5 cursor-pointer" onClick={handleDislike} />}
          <span className="ml-1">{review.notHelpful.length}</span>
        </div>
      </div>

      {showModal ? <ReviewModal showModal={showModal} setShowModal={setShowModal} review={review} /> : null}
    </div>
  )
}

export default Review
