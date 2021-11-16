import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shoe } from '../types/types'
import { titleCase } from '../utils/filterShoes'

interface Props {
  shoe: Partial<Shoe>
}

const SmallOrder = ({ shoe }: Props) => {

  return (
    <div className="flex">
      <div>
        <img src={shoe?.image?.original} className="h-150" />
      </div>

      <div>
        <Link to={`/shoe/${shoe.shoeID}`} className="text-blue-400 hover:underline">{shoe.name}</Link>
        <div className="text-xs">
          <div className="text-red-800">${shoe.retailPrice}.00</div>
          <div>{shoe.colorway}</div>
          <div>{shoe.gender && titleCase(shoe.gender)}</div>
          <div>{shoe.sku}</div>
        </div>
      </div>

    </div>
  )
}

export default SmallOrder