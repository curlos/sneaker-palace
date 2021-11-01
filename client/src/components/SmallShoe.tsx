import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Props } from '../types/types'


const SmallShoe = ({ shoe }: Props) => {
  

  return (
    <Link to={`/shoe/${shoe.shoeID}`}>
      <div className="flex flex-col items-center h-80 w-80 m-5 bg-white cursor-pointer p-5">
        <img src={shoe.image.original} className="h-9/12 w-9/12"/>
        <div>{shoe.name}</div>
        <div className="text-emerald-500">${shoe.retailPrice}</div>
      </div>
    </Link>
  )
}

export default SmallShoe;