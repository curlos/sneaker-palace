import React from 'react'

const FullShoeSkeleton = () => {
  return (
    <div className="flex justify-center">
      <div className="flex animate-pulse bg-transparent gap-4 mb-2 xl:block md:w-650 phone-sm:w-300">
        <div className="p-1 bg-gray-300 rounded-2xl h-800 w-full flex-2 mb-4">
        </div>

        <div className="rounded-2xl w-full h-800 flex flex-col flex-2">
          <div className="bg-gray-300 w-full h-100 rounded-2xl mb-4"></div>
          <div className="bg-gray-300 w-full h-400 rounded-2xl mb-4"></div>
          <div className="bg-gray-300 w-1/2 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-1/4 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-1/3 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-1/2 h-4 rounded-2xl mb-2"></div>
          <div className="bg-gray-300 w-full h-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}

export default FullShoeSkeleton
