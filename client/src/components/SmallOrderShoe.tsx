import React from 'react'
import { Link } from 'react-router-dom'
import { Shoe, IProduct } from '../types/types'
import { titleCase } from '../utils/filterShoes'
import ShoeImage from './ShoeImage'

interface Props {
  item: {
    shoe: Shoe
    product: IProduct
  }
}

const SmallOrder = ({ item }: Props) => {
  const { shoe, product } = item

  return (
    <div className="flex sm:mb-4 sm:gap-3 gap-2">
      <div className="flex-2">
        <ShoeImage src={shoe?.image?.original || ''} alt={shoe?.name || ''} />
      </div>

      <div className="flex-8 sm:flex-4">
        <Link to={`/shoe/${shoe.shoeID}`} className="text-blue-400 hover:underline">{shoe.name}</Link>
        <div className="text-sm">
          <div className="text-red-800">${shoe.retailPrice && Number(product.quantity * shoe.retailPrice).toFixed(2)}</div>
          {product.size && <div><span className="font-bold">Size:</span> {product.size}</div>}
          {shoe.colorway && <div><span className="font-bold">Colorway:</span> {shoe.colorway}</div>}
          {product.quantity && <div><span className="font-bold">Quantity:</span> {product.quantity}</div>}
          {shoe.gender && <div className="sm:hidden"><span className="font-bold">Gender:</span> {titleCase(shoe.gender)}</div>}
          {shoe.sku && <div><span className="font-bold">SKU:</span> {shoe.sku}</div>}
        </div>
      </div>

    </div>
  )
}

export default SmallOrder