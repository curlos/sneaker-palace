import React from 'react'

const SmallShoeSkeleton = () => {
  return (
    <div className="animate-pulse bg-transparent gap-2 mb-2 w-4/12 flex flex-col xl:w-6/12">
      <div className="rounded-2xl w-11/12 h-auto flex flex-col sm:w-11/12 xl:w-97/100 xl:h-auto">
        <div className="bg-gray-300 w-full h-400 rounded-2xl mb-4 sm:h-150 xl:h-400"></div>
        <div className="bg-gray-300 w-full h-6 rounded-2xl mb-4 sm:h-3"></div>
        <div className="bg-gray-300 w-3/4 h-6 rounded-2xl mb-4 sm:h-3"></div>
        <div className="bg-gray-300 w-1/2 h-6 rounded-2xl mb-4 sm:h-3"></div>
      </div>
    </div>
  )
}

export default SmallShoeSkeleton
