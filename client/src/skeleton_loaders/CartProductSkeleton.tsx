import React from 'react'

const CartProductSkeleton = () => {
  return (
    <div className="flex animate-pulse w-full bg-transparent gap-2 mb-2">
      <div className="p-1 bg-gray-300 rounded-2xl h-150 w-150">
          
      </div>

      <div className="rounded-2xl w-full h-150 flex flex-col gap-2">
        <div className="rounded-2xl w-full h-5 flex justify-between">
          <div className="rounded-2xl bg-gray-300 w-4/12 h-full"></div>
          <div className="rounded-2xl bg-gray-300 w-2/12 h-full"></div>
        </div>
        <div className="rounded-2xl bg-gray-300 w-2/12 h-5 flex flex-col"></div>
        <div className="rounded-2xl bg-gray-300 w-5/12 h-5 flex flex-col"></div>
        <div className="rounded-2xl bg-gray-300 w-4/12 h-5 flex flex-col"></div>
        <div className="rounded-2xl bg-gray-300 w-1/12 h-5 flex flex-col"></div>
      </div>
    </div>
  )
}

export default CartProductSkeleton
