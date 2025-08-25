import { PencilAltIcon, ThumbDownIcon as ThumbDownOutline, ThumbUpIcon as ThumbUpOutline, TrashIcon } from '@heroicons/react/outline'
import { ThumbDownIcon as ThumbDownSolid, ThumbUpIcon as ThumbUpSolid } from '@heroicons/react/solid'
import moment from 'moment'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import StarRatings from 'react-star-ratings'
import { useLikeRatingMutation, useDislikeRatingMutation, useDeleteRatingMutation } from '../api/ratingsApi'
import { useGetLoggedInUserQuery } from '../api/userApi'
import { RootState } from '../redux/store'
import { IRating, Shoe } from '../types/types'
import ReviewModal from './ReviewModal'

interface Props {
  shoeRating: IRating,
  shoe: Partial<Shoe>,
  onShoeRatingUpdate?: (newRating: number) => void
}

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const Review = ({ shoeRating, shoe }: Props) => {
  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  const { data: user } = useGetLoggedInUserQuery(userId);
  const history = useHistory()
  const review = shoeRating
  const [showModal, setShowModal] = useState(false)

  // RTK Query mutations
  const [likeRating] = useLikeRatingMutation()
  const [dislikeRating] = useDislikeRatingMutation()
  const [deleteRating] = useDeleteRatingMutation()

  const handleLike = async () => {
    if (!user) {
      history.push('/login');
      return;
    }

    try {
      await likeRating({
        ratingID: review._id,
        userID: user._id!,
        shoeID: shoe.shoeID!
      }).unwrap()
    } catch (error) {
      console.error('Failed to like rating:', error)
    }
  }

  const handleDislike = async () => {
    if (!user) {
      history.push('/login');
      return;
    }

    try {
      await dislikeRating({
        ratingID: review._id,
        userID: user._id!,
        shoeID: shoe.shoeID!
      }).unwrap()
    } catch (error) {
      console.error('Failed to dislike rating:', error)
    }
  }

  const handleDeleteReview = async () => {
    try {
      await deleteRating(review._id).unwrap()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <img src={review.postedByUser.profilePic ? `${process.env.REACT_APP_DEV_URL}${review.postedByUser.profilePic}` : DEFAULT_AVATAR} alt={review.postedByUser.firstName} className="h-9 w-9 rounded-full object-cover" />

          <div className="text-sm">{review.postedByUser.firstName} {review.postedByUser.lastName}</div>
        </div>

        {review.postedByUser._id === user?._id ? (
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
          {user?.helpful?.includes(review._id) ? <ThumbUpSolid className="h-5 w-5 cursor-pointer" onClick={handleLike} /> : <ThumbUpOutline className="h-5 w-5 cursor-pointer" onClick={handleLike} />}
          <span className="ml-1">{review.helpful.length}</span>
        </div>
        <div className="flex">
          {user?.notHelpful?.includes(review._id) ? <ThumbDownSolid className="h-5 w-5 cursor-pointer" onClick={handleDislike} /> : <ThumbDownOutline className="h-5 w-5 cursor-pointer" onClick={handleDislike} />}
          <span className="ml-1">{review.notHelpful.length}</span>
        </div>
      </div>

      {showModal ? <ReviewModal showModal={showModal} setShowModal={setShowModal} review={review} /> : null}
    </div>
  )
}

export default Review
