import { MenuIcon, XIcon } from '@heroicons/react/solid'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Pagination } from '../components/Pagination'
import Sidebar from '../components/Sidebar'
import SmallShoe from '../components/SmallShoe'
import { SortDropdown } from '../components/SortDropdown'
import SmallShoeSkeleton from '../skeleton_loaders/SmallShoeSkeleton'
import { Shoe } from '../types/types'
import { filterByBrand, filterByColor, filterByGender, filterByPrice } from '../utils/filterShoes'
import getInitialFilters from '../utils/getInitialFilters'
import { sortByHighestPrice, sortByLowestPrice, sortByNewest, sortByOldest } from '../utils/sortShoes'

interface stateType {
  brand?: string,
  gender?: string
}

const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']

const useQuery = () => {
  const { search } = useLocation()

  return React.useMemo(() => new URLSearchParams(search), [search])
}


const ProductList = () => {
  const query = useQuery()
  const { state } = useLocation<stateType>();

  const [shoes, setShoes] = useState([])
  const [sortedShoes, setSortedShoes] = useState<Array<Shoe>>([])
  const [paginatedShoes, setPaginatedShoes] = useState<Array<Shoe>>([])
  const [sortType, setSortType] = useState('Newest')
  const [filters, setFilters] = useState<any>(getInitialFilters(state))

  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(Number(window.innerWidth) > 1024 ? true : false)

  console.log(Number(window.innerWidth))

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      let API_URL = `${process.env.REACT_APP_DEV_URL}/shoes`

      if (query.get('query')) {
        API_URL = `${process.env.REACT_APP_DEV_URL}/shoes/query/${query.get('query')}`
      }

      console.log(API_URL)

      const response = await axios.get(API_URL)
      const newShoes: Array<Shoe> = getFilteredShoes(response.data)
      const newSortedShoes: Array<Shoe> = getSortedShoes(newShoes)
      setShoes(response.data)
      setSortedShoes(newSortedShoes)

      setLoading(false)
    }

    fetchFromAPI()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.get('query')])

  useEffect(() => {
    window.scrollTo(0, 0)
    const newShoes: Array<Shoe> = getFilteredShoes(shoes)
    const newSortedShoes: Array<Shoe> = getSortedShoes(newShoes)
    setSortedShoes(newSortedShoes)
    setCurrentPage(1)
    console.log(newSortedShoes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortType, query.get('query')])

  useEffect(() => {
    setFilters(getInitialFilters(state))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state && state['gender'], state && state['brand']])


  const getFilteredShoes = (shoesToFilter: Array<Shoe>) => {
    const colorShoes = filterByColor(filters, shoesToFilter)
    const brandShoes = filterByBrand(filters, colorShoes)
    const genderShoes = filterByGender(filters, brandShoes)
    const priceShoes = filterByPrice(filters, genderShoes)

    return priceShoes
  }

  const getSortedShoes = (shoesToSort: Array<Shoe>) => {
    switch (sortType) {
      case 'Newest':
        return sortByNewest(shoesToSort)
      case 'Oldest':
        return sortByOldest(shoesToSort)
      case 'Price: High-Low':
        return sortByHighestPrice(shoesToSort)
      case 'Price: Low-High':
        return sortByLowestPrice(shoesToSort)
      default:
        return shoesToSort
    }
  }

  const handleNewPageClick = (newPaginatedShoes: Array<Shoe>) => {
    setPaginatedShoes(newPaginatedShoes)
  }

  console.log(paginatedShoes)

  return (
    <div className="text-xl-lg">
      <div className="flex justify-center bg-gray-200 text-lg font-bold">FREE SHIPPING ON ALL SHOES</div>
      <div className="flex xl:block min-h-screen">
        {showSidebar ? <div className="flex justify-end p-3 pb-0 cursor-pointer hidden xl:block"><XIcon className="h-5 w-5" onClick={() => setShowSidebar(false)} /> </div> : null}

        {showSidebar ? <Sidebar filters={filters} setFilters={setFilters} shoeSizes={SHOE_SIZES} /> : null}

        <div className="flex-10 p-4 lg:p-3">
          <div className="flex justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowSidebar(!showSidebar)}>
              <span>Filters</span>
              <MenuIcon className="h-5 w-5" /></div>
            <SortDropdown sortType={sortType} setSortType={setSortType} />
          </div>
          {loading ?
            <div className="flex justify-center flex-wrap lg:justify-between py-4">
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
              <SmallShoeSkeleton />
            </div> : (
              <div>

                <div className="flex justify-center flex-wrap lg:justify-between">
                  {paginatedShoes.map((shoe: Shoe) => {
                    return (
                      <SmallShoe key={shoe.shoeID} shoe={shoe} />
                    )
                  })}
                </div>

                <Pagination data={sortedShoes} pageLimit={Math.ceil(sortedShoes.length / 12)} dataLimit={12} currentPage={currentPage} setCurrentPage={setCurrentPage} handleNewPageClick={handleNewPageClick} filters={filters} sortType={sortType} />
              </div>
            )}
        </div>

      </div>
    </div>
  )
}

export default ProductList