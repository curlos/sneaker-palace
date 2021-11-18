import React from 'react'

const FullShoeSkeleton = () => {
  return (
    <div className="flex animate-pulse w-full bg-transparent gap-2 mb-2">
      <div className="p-1 bg-gray-300 rounded-2xl h-800 w-800 flex-2">
      </div>

      <div className="rounded-2xl w-800 h-800 flex flex-col flex-2">
        <div className="bg-gray-300 w-800 h-100 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-800 h-150 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-800 h-50 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-800 h-200 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-800 h-200 rounded-2xl mb-4"></div>
        <div className="bg-gray-300 w-800 h-200 rounded-2xl"></div>
      </div>
    </div>
  )
}

export default FullShoeSkeleton
