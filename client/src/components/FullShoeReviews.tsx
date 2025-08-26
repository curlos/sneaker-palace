import { Link } from 'react-router-dom'
import StarRatings from 'react-star-ratings'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { useState, useRef } from 'react'
import { IRating, Shoe } from '../types/types'
import Review from './Review'
import StarRatingProgress from './StarRatingProgress'
import { Pagination } from './Pagination'
import * as short from "short-uuid"
import { useLikeRatingMutation, useDislikeRatingMutation } from '../api/ratingsApi'
import { useGetLoggedInUserQuery } from '../api/userApi'
import { RootState } from '../redux/store'

interface Props {
  shoe: Partial<Shoe>,
  shoeRatings: Array<IRating>
}

const REVIEWS_PER_PAGE = 5

const FullShoeReviews = ({ shoe, shoeRatings }: Props) => {
  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  const { data: user } = useGetLoggedInUserQuery(userId);
  const history = useHistory()
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsRef = useRef<HTMLDivElement>(null)
  
  // RTK Query mutations
  const [likeRating, { isLoading: isLikeLoading }] = useLikeRatingMutation()
  const [dislikeRating, { isLoading: isDislikeLoading }] = useDislikeRatingMutation()

  // Pagination logic
  const totalPages = Math.ceil(shoeRatings.length / REVIEWS_PER_PAGE)
  const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE
  const endIndex = startIndex + REVIEWS_PER_PAGE
  const paginatedReviews = shoeRatings.slice(startIndex, endIndex)

  const handleLike = async (ratingID: string) => {
    if (!user) {
      history.push('/login');
      return;
    }

    try {
      await likeRating({
        ratingID: ratingID,
        userID: user._id!,
        shoeID: shoe.shoeID!
      }).unwrap()
    } catch (error) {
      console.error('Failed to like rating:', error)
    }
  }

  const handleDislike = async (ratingID: string) => {
    if (!user) {
      history.push('/login');
      return;
    }

    try {
      await dislikeRating({
        ratingID: ratingID,
        userID: user._id!,
        shoeID: shoe.shoeID!
      }).unwrap()
    } catch (error) {
      console.error('Failed to dislike rating:', error)
    }
  }

  return (
    <div className="border-t border-gray-300 flex pt-8 xl:block xl:px-4">
      <div className="mr-12 flex-2 xl:mb-10">
        <div className="text-2xl font-bold">Customer reviews</div>
        <div className="flex gap-2 items-center">
          <StarRatings
            rating={Number((shoe.rating || 0).toFixed(2))}
            starRatedColor='#F5B327'
            numberOfStars={5}
            name='rating'
            starDimension='20px'
            starSpacing='2px'
          />
          {shoeRatings.length === 0 ? (
            <span className="text-lg">No reviews</span>
          ) : (
            <span className="text-lg">{(shoe.rating || 0).toFixed(2)} out of 5</span>
          )}
        </div>

        <div className="text-gray-700">{shoeRatings.length} global ratings</div>

        <div>
          <StarRatingProgress rating={5} percentage={shoeRatings.filter((rating) => rating.ratingNum === 5).length / shoeRatings.length} />
          <StarRatingProgress rating={4} percentage={shoeRatings.filter((rating) => rating.ratingNum === 4).length / shoeRatings.length} />
          <StarRatingProgress rating={3} percentage={shoeRatings.filter((rating) => rating.ratingNum === 3).length / shoeRatings.length} />
          <StarRatingProgress rating={2} percentage={shoeRatings.filter((rating) => rating.ratingNum === 2).length / shoeRatings.length} />
          <StarRatingProgress rating={1} percentage={shoeRatings.filter((rating) => rating.ratingNum === 1).length / shoeRatings.length} />
        </div>

        <div className="mb-4">
          <div className="text-xl font-bold">Review this product</div>
          <div className="my-3">Share your thoughts with other customers</div>
          <Link to={`/shoe/submit-review/${shoe.shoeID}`} className="px-5 py-2 border border-gray-300">Write a customer review</Link>
        </div>
      </div>

      {shoeRatings.length > 0 ? (
        <div className="flex-8">
          <div ref={reviewsRef} className="text-2xl font-bold mb-4">
            Top reviews
          </div>

          <div>
            {paginatedReviews.map((shoeRating) => <Review 
              key={`${shoeRating}-${short.generate()}`} 
              shoeRating={shoeRating} 
              shoe={shoe}
              onLike={handleLike}
              onDislike={handleDislike}
              isLoading={isLikeLoading || isDislikeLoading}
            />)}
          </div>

          {shoeRatings.length > REVIEWS_PER_PAGE && (
            <Pagination 
              data={paginatedReviews} 
              pageLimit={totalPages} 
              dataLimit={REVIEWS_PER_PAGE} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
              filters={{}} 
              sortType="" 
              totalItemCount={shoeRatings.length}
              scrollTarget={reviewsRef}
            />
          )}
        </div>
      ) : null}
    </div>
  )
}

export default FullShoeReviews