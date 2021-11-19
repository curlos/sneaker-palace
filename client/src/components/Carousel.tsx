import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCarouselData } from '../utils/getCarouselData'

const Carousel = () => {
  const [num, setNum] = useState(0)
  const data = getCarouselData()
  const [currentShoe, setCurrentShoe] = useState(Object.values(data)[num])

  console.log(data)
  console.log(currentShoe)

  useEffect(() => {
    const interval = setInterval(() => {
      if (num + 1 === 3) {
        setNum(0)
        setCurrentShoe(Object.values(data)[0])
      } else {
        setNum(num + 1)
        setCurrentShoe(Object.values(data)[num + 1])
      }
    }, 4000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <div className={`bg-${currentShoe.imageName} h-screen bg-cover flex items-center text-white font-bold`}>
      <div className="ml-10 pb-10 w-1/4 sm:w-3/4">
        <div className="text-5xl mb-3 sm:text-5xl">{currentShoe.name}</div>
        <Link to={`/shoe/${currentShoe.shoeID}`} className="underline">Shop Now</Link>
      </div>
    </div>
  )
}

export default Carousel