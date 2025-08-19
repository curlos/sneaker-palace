import { ChevronRightIcon } from '@heroicons/react/solid'
import React from 'react'
import { Link } from 'react-router-dom'
import ShoeImage from './ShoeImage'
import { Shoe } from '../types/types'

interface Props {
  shoe: Shoe,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
}

const ListShoe = ({ shoe, setShowModal }: Props) => {

  return (
    <Link to={`/shoe/${shoe.shoeID}`} className="flex justify-between items-center py-4 border-0 border-b border-solid border-gray-300" onClick={() => setShowModal(false)}>
      <div className="flex items-center">
        <ShoeImage src={shoe.image.original} alt={shoe.name} className="h-16" />

        <div className="ml-5">{shoe.name}</div>
      </div>

      <div>
        <ChevronRightIcon className="h-5 w-5" />
      </div>
    </Link>
  )
}

export default ListShoe
