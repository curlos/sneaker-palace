import React, { FormEvent } from 'react'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { Shoe } from '../types/types'
import ListShoe from './ListShoe'
import { useSearchShoesQuery } from '../api/shoesApi'

interface Props {
  searchText: string,
  finalSearchText: string,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  handleSubmit: (e: FormEvent<Element>) => Promise<void>
}

const SmallProductList = ({ searchText, finalSearchText, setShowModal, handleSubmit }: Props) => {

  // Use the search query for initial load (empty search)
  const { data: initialData, isLoading: initialLoading } = useSearchShoesQuery({
    searchText: "",
    pageNum: 1
  })
  
  // Use the search query for actual searches (only when finalSearchText exists)
  const { data: searchData, isLoading: searchLoading } = useSearchShoesQuery({
    searchText: finalSearchText,
    pageNum: 1
  }, {
    skip: !finalSearchText.trim() // Skip query when no search text
  })

  // Determine what data to show and loading state
  const shoes = finalSearchText.trim() ? searchData?.docs || [] : initialData?.docs || []
  const loading = finalSearchText.trim() ? searchLoading : initialLoading

  return (
    loading ? <div className="flex justify-center py-4"><CircleLoader size={16} /></div> : (
      <div>

        {searchText && (
          <div className="flex justify-between p-6 border-0 border-b border-solid border-gray-300 text-sm cursor-pointer" onClick={handleSubmit}>
            <div>{searchText}</div>
            <div className="text-gray-500">{shoes && shoes.length} RESULTS</div>
          </div>
        )}

        <div className="p-6 pt-0">
          <div className="py-4 border-0 border-b border-solid border-gray-300 text-gray-500 text-sm">
            Results
          </div>
          {shoes && shoes.slice(0, 5).map((shoe: Shoe) => <ListShoe key={shoe._id} shoe={shoe} setShowModal={setShowModal} />)}
        </div>
      </div>
    )
  )
}

export default SmallProductList
