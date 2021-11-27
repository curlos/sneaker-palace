import axios from 'axios'
import React, { FormEvent, useEffect, useState } from 'react'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import ListShoe from './ListShoe'

interface Props {
  searchText: string,
  finalSearchText: string,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  handleSubmit: (e: FormEvent<Element>) => Promise<void>
}

const SmallProductList = ({ searchText, finalSearchText, setShowModal, handleSubmit }: Props) => {

  const [shoes, setShoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    setLoading(true)

    const fetchFromAPI = async () => {
      const response = await axios.post(`${process.env.REACT_APP_DEV_URL}/shoes/search`, {
        searchText,
        pageNum: 1
      })

      setShoes(response.data.docs)
      setLoading(false)
    }
    fetchFromAPI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalSearchText])

  return (
    loading ? <div className="flex justify-center py-4"><CircleLoader size={16} /></div> : (
      <div>

        <div className="flex justify-between p-6 border-0 border-b border-solid border-gray-300 text-sm cursor-pointer" onClick={handleSubmit}>
          <div>{searchText}</div>
          <div className="text-gray-500">{shoes && shoes.length} RESULTS</div>
        </div>

        <div className="p-6 pt-0">
          <div className="py-4 border-0 border-b border-solid border-gray-300 text-gray-500 text-sm">Results</div>
          {shoes && shoes.slice(0, 5).map((shoe) => <ListShoe shoe={shoe} setShowModal={setShowModal} />)}
        </div>
      </div>
    )
  )
}

export default SmallProductList
