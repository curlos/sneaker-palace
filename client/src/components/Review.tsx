import React from 'react'
import { IRating } from '../types/types'
import StarRatingComponent from 'react-star-rating-component'
import { ThumbUpIcon as ThumbUpSolid, ThumbDownIcon as ThumbDownSolid } from '@heroicons/react/outline'
import { ThumbUpIcon as ThumbUpOutline, ThumbDownIcon as ThumbDownOutline } from '@heroicons/react/outline'
import moment from 'moment'

interface Props {
  shoeRating: IRating
}

const Review = ({ shoeRating }: Props) => {

  console.log(shoeRating)
  return (
    <div className="mb-6">
      <div className="flex gap-2 items-center">
        <img src="https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png" alt={shoeRating.postedByUser.firstName} className="h-8 w-8"/>

        <div className="text-sm">{shoeRating.postedByUser.firstName} {shoeRating.postedByUser.lastName}</div>
      </div>
      <div className="flex">
        <StarRatingComponent
          name={'Rating'}
          value={shoeRating.ratingNum}
          starCount={5}
          editing={false}
          starColor={'#10B981'}
        />
        <div className="ml-2 font-bold">{shoeRating.summary}</div>
      </div>

      <div className="text-sm text-gray-600">Reviewed on {moment(shoeRating.createdAt).format('MMMM Do, YYYY')}</div>
      <div className="text-sm font-medium text-orange-700">Verified Purchase</div>
      <div className="text-sm my-2">{shoeRating.text}</div>
      <div className="text-sm flex gap-2">
        <div>Helpful? </div>
        <div className="flex">
          <ThumbUpOutline className="h-5 w-5"/>
          <span className="ml-1">{shoeRating.helpful.length}</span>
        </div>
        <div className="flex">
          <ThumbUpOutline className="h-5 w-5"/>
          <span className="ml-1">{shoeRating.helpful.length}</span>
        </div>
      </div>
    </div>
  )
}

export default Review
