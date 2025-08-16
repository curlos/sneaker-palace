import { ChevronDownIcon } from '@heroicons/react/solid'
import { Link } from 'react-router-dom'
// import StarRatingComponent from 'react-star-rating-component'
import { Props } from '../types/types'

const SmallShoe = ({ shoe }: Props) => {

  return (
    <Link to={`/shoe/${shoe.shoeID}`} className="w-4/12 sm:w-6/12">
      <div className="flex flex-col bg-white cursor-pointer mr-5 mb-5 px-3 sm:mr-0">
        <img src={shoe.image.original} alt={shoe.name} className="h-9/12 w-9/12 sm:w-full" />
        <div className="font-medium">{shoe.name}</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.gender}'s</span> Shoe</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.colorway}</span></div>
        <div className="flex items-center">
          {/* <StarRatingComponent
            name={'Rating'}
            value={shoe.rating}
            starCount={5}
            editing={false}
            starColor={'#F5B327'}
          /> */}
          <span className="flex items-center"><ChevronDownIcon className="h-5 w-5" aria-hidden="true" />{shoe.ratings.length}</span>
        </div>
        <span className="font-medium text-lg">${shoe.retailPrice}</span>

      </div>
    </Link>
  )
}

export default SmallShoe;