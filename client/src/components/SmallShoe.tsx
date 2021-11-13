import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IRating, Props } from '../types/types'
import StarRatingComponent from 'react-star-rating-component'
import { ChevronDownIcon } from '@heroicons/react/solid'
import axios from 'axios'
import SmallShoeSkeleton from '../skeleton_loaders/SmallShoeSkeleton'


const SmallShoe = ({ shoe }: Props) => {

  const [ratings, setRatings] = useState<Array<IRating>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRatings = async () => {
      const newRatings = await fetchAllRatings(shoe.ratings)
      setRatings(newRatings)
      setLoading(false)
    }
    fetchRatings()
  }, [shoe])

  const fetchAllRatings = async (ratingIDs: Array<string>) => {
    const ratings = []
    console.log(ratingIDs)
    if (ratingIDs) {
      for (let ratingID of ratingIDs) {
        const response = await axios.get(`http://localhost:8888/rating/${ratingID}`)
        console.log(response.data)
        if (response.data !== null) {
          const authorResponse = await axios.get(`http://localhost:8888/users/${response.data.userID}`)
          ratings.push({...response.data, postedByUser: authorResponse.data})
        }
      }
    }
    return ratings
  }

  const getAverageRating = (ratings: Array<IRating>) => {
    const sumOfRatings = ratings.reduce( ( sum, { ratingNum } ) => sum + ratingNum , 0)

    console.log(sumOfRatings)

    return Number((sumOfRatings / ratings.length).toFixed(1))
  }

  return (
    loading || shoe.shoeID === 'de4f41ea-be27-4954-9112-f519e1b00232' ? <SmallShoeSkeleton /> : (
      <Link to={`/shoe/${shoe.shoeID}`}>
        <div className="flex flex-col w-96 wm-5 bg-white cursor-pointer mr-5 mb-5 px-3 ">
          <img src={shoe.image.original} alt={shoe.name} className="h-9/12 w-9/12"/>
          <div className="font-medium">{shoe.name}</div>
          <div className="text-gray-500"><span className="capitalize">{shoe.gender}'s</span> Shoe</div>
          <div className="text-gray-500"><span className="capitalize">{shoe.colorway}</span></div>
          <div className="flex items-center">
            <StarRatingComponent
                name={'Rating'}
                value={getAverageRating(ratings)}
                starCount={5}
                editing={false}
                starColor={'#F5B327'}
            />
            <span className="flex items-center"><ChevronDownIcon className="h-5 w-5" aria-hidden="true" />{ratings.length}</span>
          </div>
          <span className="font-medium text-lg">${shoe.retailPrice}</span>

        </div>
      </Link>
    )
  )
}

export default SmallShoe;