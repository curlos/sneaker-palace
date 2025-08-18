import { ChevronDownIcon } from '@heroicons/react/solid'
import { Link } from 'react-router-dom'
import StarRatings from 'react-star-ratings'
import { Props } from '../types/types'
import { useState } from 'react';

const SmallShoe = ({ shoe }: Props) => {
  const [originalImageLoaded, setOriginalImageLoaded] = useState(true)

  return (
    <Link to={`/shoe/${shoe.shoeID}`} className="w-4/12 sm:w-6/12">
      <div className="flex flex-col bg-white cursor-pointer mr-5 mb-5 px-3 sm:mr-0">
        <div className="w-full relative overflow-hidden" style={{ paddingBottom: '100%' }}>
          <img 
            src={originalImageLoaded ? shoe.image.original : "/assets/icon.png"} 
            alt={shoe.name} 
            className={originalImageLoaded ? "absolute inset-0 h-full w-full object-cover" : "absolute inset-0 h-2/3 w-2/3 object-contain m-auto"} 
            onError={() => setOriginalImageLoaded(false)} 
          />
        </div>
        <div className="font-medium">{shoe.name}</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.gender}'s</span> Shoe</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.colorway}</span></div>
        <div className="flex items-center">
          <StarRatings
            rating={shoe.rating || 0}
            starRatedColor='#F5B327'
            numberOfStars={5}
            name='rating'
            starDimension='16px'
            starSpacing='1px'
          />
          <span className="flex items-center"><ChevronDownIcon className="h-5 w-5" aria-hidden="true" />{shoe.ratings.length}</span>
        </div>
        <span className="font-medium text-lg">${shoe.retailPrice}</span>

      </div>
    </Link>
  )
}

export default SmallShoe;