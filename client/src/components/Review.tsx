import React, { useState } from 'react'
import { IRating, UserType } from '../types/types'
import StarRatingComponent from 'react-star-rating-component'
import { ThumbUpIcon as ThumbUpSolid, ThumbDownIcon as ThumbDownSolid } from '@heroicons/react/outline'
import { ThumbUpIcon as ThumbUpOutline, ThumbDownIcon as ThumbDownOutline } from '@heroicons/react/outline'
import moment from 'moment'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import axios from 'axios'
import { updateUser } from '../redux/userRedux'

interface Props {
  shoeRating: IRating
}

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const Review = ({ shoeRating }: Props) => {
  
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const dispatch = useDispatch()
  const [review, setReview] = useState(shoeRating)

  const handleLike = async () => {
    const body = {
      ratingID: review._id,
      userID: user._id
    }
    const response = await axios.put(`http://localhost:8888/rating/like`, body)
    console.log(response)
    setReview({...review, helpful: response.data.updatedRating.helpful})
    dispatch(updateUser(response.data.updatedUser))
  }

  const handleDislike = async () => {
    const body = {
      ratingID: review._id,
      userID: user._id
    }
    const response = await axios.put(`http://localhost:8888/rating/dislike`, body)
    console.log(response)
    setReview({...review, notHelpful: response.data.updatedRating.notHelpful})
    dispatch(updateUser(response.data.updatedUser))
  }

  console.log(user)
  
  return (
    <div className="mb-6">
      <div className="flex gap-2 items-center">
        <img src={review.postedByUser.profilePic ? `http://localhost:8888${review.postedByUser.profilePic}` : DEFAULT_AVATAR}  alt={review.postedByUser.firstName} className="h-9 w-9 rounded-full object-cover"/>

        <div className="text-sm">{review.postedByUser.firstName} {review.postedByUser.lastName}</div>
      </div>
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

      <div className="text-sm text-gray-600">Reviewed on {moment(review.createdAt).format('MMMM Do, YYYY')}</div>
      <div className="text-sm font-medium text-orange-700">Verified Purchase</div>
      <div className="text-sm my-2">{review.text}</div>
      
      {review.photo ? <img src={`http://localhost:8888${review.photo}`} alt="" className="h-36 object-cover my-2"/> : null}

      <div className="text-sm flex gap-2">
        <div>Helpful? </div>
        <div className="flex">
          <ThumbUpOutline className="h-5 w-5 cursor-pointer" onClick={handleLike}/>
          <span className="ml-1">{review.helpful.length}</span>
        </div>
        <div className="flex">
          <ThumbDownOutline className="h-5 w-5 cursor-pointer" onClick={handleDislike}/>
          <span className="ml-1">{review.notHelpful.length}</span>
        </div>
      </div>
    </div>
  )
}

export default Review
