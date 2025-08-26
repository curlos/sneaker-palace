import { useState, useEffect } from "react"
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
  const shoes = shoesData?.docs?.slice(0, 3)

  return (
    loading ? <div className="flex justify-center py-4"><CircleLoader size={16} /></div> : (
      <div className="flex flex-wrap sm:justify-between">
        {shoes?.map((shoe: Shoe) => <SmallShoe key={`${shoe._id}-${short.generate()}`} shoe={shoe} />)}
      </div>
    )
  )
}

export default MoreShoes