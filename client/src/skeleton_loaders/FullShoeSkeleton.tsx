import React from 'react'

const FullShoeSkeleton = () => {
  return (
    <div className="flex justify-center">
      <div className="flex animate-pulse bg-transparent gap-4 mb-2 w-1800 xl:block">
        <div className="p-1 bg-gray-300 rounded-2xl w-full h-900 flex-2 xl:mb-4 sm:h-300 md:h-400 lg:h-600 xl:h-700">
        </div>

        <div className="rounded-2xl w-full h-900 flex flex-col flex-2">
          <div className="bg-gray-300 w-full h-100 rounded-2xl mb-4"></div>
          <div className="bg-gray-300 w-full h-400 rounded-2xl mb-4"></div>
          <div className="bg-gray-300 w-1/2 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-1/4 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-1/3 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-1/2 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-full h-350 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}

export default FullShoeSkeleton
