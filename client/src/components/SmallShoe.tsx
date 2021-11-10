import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Props } from '../types/types'
import StarRatingComponent from 'react-star-rating-component'
import { ChevronDownIcon } from '@heroicons/react/solid'


const SmallShoe = ({ shoe }: Props) => {

  return (
    <Link to={`/shoe/${shoe.shoeID}`}>
      <div className="flex flex-col w-96 wm-5 bg-white cursor-pointer mr-5 mb-5 px-3 ">
        <img src={shoe.image.original} alt={shoe.name} className="h-9/12 w-9/12"/>
        <div className="font-medium">{shoe.name}</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.gender}'s</span> Shoe</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.colorway}</span></div>
        <div className="flex items-center">
          <StarRatingComponent
              name={'Rating'}
              value={shoe.rating}
              starCount={5}
              editing={false}
              starColor={'#F5B327'}
          />
          <span className="flex items-center"><ChevronDownIcon className="h-5 w-5" aria-hidden="true" />{shoe.ratings.length}</span>
        </div>
        <span className="font-medium text-lg">${shoe.retailPrice}</span>

      </div>
    </Link>
  )
}

export default SmallShoe;