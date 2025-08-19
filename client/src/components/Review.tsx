import { PencilAltIcon, ThumbDownIcon as ThumbDownOutline, ThumbUpIcon as ThumbUpOutline, TrashIcon } from '@heroicons/react/outline'
import { ThumbDownIcon as ThumbDownSolid, ThumbUpIcon as ThumbUpSolid } from '@heroicons/react/solid'
import axios from 'axios'
import moment from 'moment'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import StarRatings from 'react-star-ratings'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import { IRating, Shoe, UserType } from '../types/types'
import ReviewModal from './ReviewModal'

interface Props {
  shoeRating: IRating,
  shoeRatings: Array<IRating>,
  setShoeRatings: React.Dispatch<React.SetStateAction<Array<IRating>>>,
  shoe: Partial<Shoe>,
  onShoeRatingUpdate?: (newRating: number) => void
}

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const Review = ({ shoeRating, shoeRatings, setShoeRatings, shoe, onShoeRatingUpdate }: Props) => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const dispatch = useDispatch()
  const history = useHistory()
  const review = shoeRating
  const [showModal, setShowModal] = useState(false)

  const handleLike = async () => {
    if (Object.keys(user).length === 0 || !user) {
      history.push('/login');
      return;
    }

    const body = {
      ratingID: review._id,
      userID: user._id
    }
    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/rating/like`, body)

    const updatedRating = { ...review, helpful: response.data.updatedRating.helpful, notHelpful: response.data.updatedRating.notHelpful }
    
    // Update only the parent's ratings array
    setShoeRatings(shoeRatings.map(rating => 
      rating._id === review._id ? updatedRating : rating
    ))
    
    dispatch(updateUser(response.data.updatedUser))
  }

  const handleDislike = async () => {
    if (Object.keys(user).length === 0 || !user) {
      history.push('/login');
      return;
    }

    const body = {
      ratingID: review._id,
      userID: user._id
    }
    const response = await axios.put(`${process.env.REACT_APP_DEV_URL}/rating/dislike`, body)

    const updatedRating = { ...review, notHelpful: response.data.updatedRating.notHelpful, helpful: response.data.updatedRating.helpful }
    
    // Update only the parent's ratings array
    setShoeRatings(shoeRatings.map(rating => 
      rating._id === review._id ? updatedRating : rating
    ))
    
    dispatch(updateUser(response.data.updatedUser))
  }

  const handleDeleteReview = async () => {
    const response = await axios.delete(`${process.env.REACT_APP_DEV_URL}/rating/${review._id}`)
    
    setShoeRatings(shoeRatings.filter((shoeRating) => shoeRating._id !== review._id))
    
    // Update the shoe rating in the parent component
    if (onShoeRatingUpdate && response.data.updatedShoe) {
      onShoeRatingUpdate(response.data.updatedShoe.rating)
    }
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
        <StarRatings
          rating={review.ratingNum || 0}
          starRatedColor='#F5B327'
          numberOfStars={5}
          name='rating'
          starDimension='16px'
          starSpacing='1px'
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
