import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Props } from '../types/types'


const SmallShoe = ({ shoe }: Props) => {

  console.log(shoe)
  

  return (
    <Link to={`/shoe/${shoe.shoeID}`}>
      <div className="flex flex-col h-96 w-96 wm-5 bg-white cursor-pointer mr-5 mb-5 px-3 ">
        <img src={shoe.image.original} alt={shoe.name} className="h-9/12 w-9/12"/>
        <div className="font-medium">{shoe.name}</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.gender}'s</span> Shoe</div>
        <div className="text-gray-500"><span className="capitalize">{shoe.colorway}</span></div>
        <div className="text-emerald-500">${shoe.retailPrice}</div>
      </div>
    </Link>
  )
}

export default SmallShoe;