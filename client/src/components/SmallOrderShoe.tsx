import React from 'react'
import { Link } from 'react-router-dom'
import { Shoe } from '../types/types'
import { titleCase } from '../utils/filterShoes'
import ShoeImage from './ShoeImage'

interface Props {
  shoe: Partial<Shoe>
}

const SmallOrder = ({ shoe }: Props) => {

  return (
    <div className="flex sm:mb-4 sm:gap-3 gap-2">
      <div className="flex-2">
        <ShoeImage src={shoe?.image?.original || ''} alt={shoe?.name || ''} />
      </div>

      <div className="flex-8 sm:flex-4">
        <Link to={`/shoe/${shoe.shoeID}`} className="text-blue-400 hover:underline">{shoe.name}</Link>
        <div className="text-xs">
          <div className="text-red-800">${shoe.retailPrice}.00</div>
          <div className="sm:hidden">{shoe.colorway}</div>
          <div>{shoe.gender && titleCase(shoe.gender)}</div>
          <div>{shoe.sku}</div>
        </div>
      </div>

    </div>
  )
}

export default SmallOrder