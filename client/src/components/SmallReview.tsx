import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { IRating, Shoe, UserType } from '../types/types'
import StarRatingComponent from 'react-star-rating-component'
import { Link } from 'react-router-dom'
import moment from 'moment'

interface Props {
  review: IRating,
  author: Partial<UserType>
}

const DEFAULT_AVATAR = 'https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX460_.png'

const SmallReview = ({ review, author }: Props) => {

  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)

    const fetchFromAPI = async () => {
      console.log(review.shoeID)
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/${review.shoeID}`)
      setShoe(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [])


  return (
    <div className="border border-gray-300 rounded-lg bg-white mb-4">
      <div className="flex items-center gap-3 text-sm my-3 border-0 border-b border-solid border-gray-300 p-3">
        <div>
          <img src={author.profilePic ? `${process.env.REACT_APP_DEV_URL}${author.profilePic}` : DEFAULT_AVATAR} alt={author?.firstName} className="h-9 w-9 rounded-full object-cover" />
        </div>
        <div>{author.firstName} {author.lastName}</div>
        <div className="text-gray-600 text-xs">reviewed a shoe • {moment(review.createdAt).format('MMMM Do, YYYY')}</div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <StarRatingComponent
            name={'Rating'}
            value={review.ratingNum}
            starCount={5}
            editing={false}
            starColor={'#F5B327'}
          />
          <div className="text-sm text-orange-700">Verified Purchase</div>
        </div>
        <div className="font-bold">{review.summary}</div>
        <div className="text-sm">{review.text}</div>
        <div className="border border-gray-300 rounded-lg bg-white mt-2">
          <Link to={`/shoe/${shoe.shoeID}`}>
            <div className="flex items-center gap-2">
              <div>
                <img src={shoe?.image?.original} alt={shoe.name} className="h-24 w-24" />
              </div>
              <div>
                <div className="text-sm">{shoe.name}</div>
                <div className="flex items-center gap-2">
                  <StarRatingComponent
                    name={'Rating'}
                    value={4}
                    starCount={5}
                    editing={false}
                    starColor={'#F5B327'}
                  />
                  <div className="text-sm text-gray-700">{shoe?.ratings?.length}</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div></div>
      </div>
    </div>
  )
}

export default SmallReview