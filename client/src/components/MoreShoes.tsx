import { useState, useEffect } from "react"
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid"
import { useGetShoesFromPageQuery } from "../api/shoesApi"
import CircleLoader from "../skeleton_loaders/CircleLoader"
import { Shoe } from "../types/types"
import SmallShoe from "./SmallShoe"
import * as short from "short-uuid"

interface MoreShoesProps {
  currentShoeId?: string;
}

const MoreShoes = ({ currentShoeId }: MoreShoesProps) => {

  const [randomPageNum, setRandomPageNum] = useState(() => Math.floor(Math.random() * 800))
  
  // Regenerate random page when currentShoeId changes (if provided)
  useEffect(() => {
    if (currentShoeId) {
      setRandomPageNum(Math.floor(Math.random() * 800))
    }
  }, [currentShoeId])

  const { data: shoesData, isLoading: loading } = useGetShoesFromPageQuery(randomPageNum)
  const allShoes = shoesData?.docs || []

  // Responsive breakpoints for carousel
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 640 },
      items: 3,
      slidesToSlide: 3 // Move 3 items at once
    },
    mobile: {
      breakpoint: { max: 640, min: 0 },
      items: 2,
      slidesToSlide: 2 // Move 2 items at once on mobile
    }
  }

  // Custom arrow components
  const CustomLeftArrow = ({ onClick }: any) => (
    <button 
      onClick={onClick}
      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-600"
    >
      <ChevronLeftIcon className="h-5 w-5" />
    </button>
  )

  const CustomRightArrow = ({ onClick }: any) => (
    <button 
      onClick={onClick}
      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-gray-300 hover:border-gray-600"
    >
      <ChevronRightIcon className="h-5 w-5" />
    </button>
  )

  // Custom dot component for indicators
  const CustomDot = ({ onClick, active }: any) => (
    <button
      onClick={onClick}
      className={`w-8 h-1 rounded-full mx-1 transition-all duration-200 ${
        active ? 'bg-gray-800' : 'bg-gray-300'
      }`}
    />
  )

  return (
    loading ? <div className="flex justify-center py-4"><CircleLoader size={16} /></div> : (
      <div className="mt-7">
        {/* Header */}
        <div className="text-2xl mb-4">
          You Might Also Like
        </div>

        {/* Carousel */}
        <div>
          <Carousel
            responsive={responsive}
            infinite={true}
            autoPlay={false}
            showDots={true}
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
            swipeable={true}
            customDot={<CustomDot />}
            dotListClass="flex justify-center mt-4 space-x-2"
            containerClass="carousel-container"
            itemClass="px-2"
          >
            {allShoes.map((shoe: Shoe) => (
              <SmallShoe key={`${shoe._id}-${short.generate()}`} shoe={shoe} />
            ))}
          </Carousel>
        </div>
      </div>
    )
  )
}

export default MoreShoes