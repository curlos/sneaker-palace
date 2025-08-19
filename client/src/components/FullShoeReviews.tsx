import React from 'react'
import { Link } from 'react-router-dom'
import StarRatings from 'react-star-ratings'
import { IRating, Shoe } from '../types/types'
import Review from './Review'
import StarRatingProgress from './StarRatingProgress'
import * as short from "short-uuid"

interface Props {
  shoe: Partial<Shoe>,
  shoeRatings: Array<IRating>,
  setShoeRatings: React.Dispatch<React.SetStateAction<Array<IRating>>>,
  onShoeRatingUpdate?: (newRating: number) => void
}

const FullShoeReviews = ({ shoe, shoeRatings, setShoeRatings, onShoeRatingUpdate }: Props) => {


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
          <div className="text-2xl font-bold mb-4">
            Top reviews
          </div>


          <div>
            {shoeRatings.map((shoeRating) => <Review key={`${shoeRating}-${short.generate()}`} shoeRating={shoeRating} shoe={shoe} shoeRatings={shoeRatings} setShoeRatings={setShoeRatings} onShoeRatingUpdate={onShoeRatingUpdate} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default FullShoeReviews