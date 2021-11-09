import React from 'react'

interface Props {
  rating: number
}

const StarRatingProgress = ({ rating }: Props) => {
  return (
    <div>
      <div>{rating === 1 ? '1 star' : `${rating} stars`}</div>
      <div className="relative pt-1">
        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-lakersGold-100">
          <div style={{ width: "88%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-lakersGold-500"></div>
        </div>
      </div>
    </div>
  )
}

export default StarRatingProgress
