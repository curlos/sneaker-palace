import React from 'react'

const SmallShoeSkeleton = () => {
  return (
    <div className="animate-pulse bg-transparent gap-2 mb-2 w-4/12 flex flex-col">
      <div className="rounded-2xl w-300 h-400 flex flex-col">
        <div className="bg-gray-300 w-full h-300 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-full h-6 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-3/4 h-6 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-1/2 h-6 rounded-2xl mb-4"></div>
      </div>
    </div>
  )
}

export default SmallShoeSkeleton
