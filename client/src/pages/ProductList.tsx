import React, { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import SmallShoe from '../components/SmallShoe'
import { Shoe } from '../types/types'
import { filterByBrand, filterByColor, filterByGender, filterByPrice } from '../utils/filterShoes'
import { SortDropdown } from '../components/SortDropdown'
import { sortByHighestPrice, sortByLowestPrice, sortByNewest, sortByOldest } from '../utils/sortShoes'
import { Pagination } from '../components/Pagination'
import { useLocation } from 'react-router-dom'
import CircleLoader from '../skeleton_loaders/CircleLoader'

const useQuery = () => {
  const { search } = useLocation()

  return React.useMemo(() => new URLSearchParams(search), [search])
}


const ProductList = () => {


  const query = useQuery()

  const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17']

  const [shoes, setShoes] = useState([])
  const [filteredShoes, setFilteredShoes] = useState<Array<Shoe>>([])
  const [sortedShoes, setSortedShoes] = useState<Array<Shoe>>([])
  const [paginatedShoes, setPaginatedShoes] = useState<Array<Shoe>>([])
  const [displayedShoes, setDisplayedShoes] = useState<Array<Shoe>>([])
  const [sortType, setSortType] = useState('Newest')
  const [filters, setFilters] = useState<any>({
    colors: {
      'red': false as boolean,
      'white': false as boolean,
      'yellow': false as boolean,
      'black': false as boolean,
      'blue': false as boolean,
      'brown': false as boolean,
      'green': false as boolean,
      'gray': false as boolean,
      'pink': false as boolean,
      'purple': false as boolean,
    },
    brands: {
      "Adidas": false as boolean,
      "Air Jordan": false as boolean,
      "Alexander McQueen": false as boolean,
      "Asics": false as boolean,
      "Balenciaga": false as boolean,
      "Burberry": false as boolean,
      "Chanel": false as boolean,
      "Common Projects": false as boolean,
      "Converse": false as boolean,
      "Crocs": false as boolean,
      "Diadora": false as boolean,
      "Dior": false as boolean,
      "Gucci": false as boolean,
      "Jordan": false as boolean,
      "Li Ning": false as boolean,
      "New Balance": false as boolean,
      "Nike": false as boolean,
      "Louis Vuitton": false as boolean,
      "Off-White": false as boolean,
      "Prada": false as boolean,
      "Puma": false as boolean,
      "Reebok": false as boolean,
      "Saint Laurent": false as boolean,
      "Saucony": false as boolean,
      "Vans": false as boolean,
      "Yeezy": false as boolean,
    },
    genders: {
      "Men": false,
      "Women": false,
      "Infant": false,
      "Youth": false
    },
    priceRanges: {
      "$0 - $25": {
        priceRanges: {
          low: 0,
          high: 25
        },
        checked: false
      },
      "$25 - $50": {
        priceRanges: {
          low: 25,
          high: 50
        },
        checked: false
      },
      "$50 - $100": {
        priceRanges: {
          low: 50,
          high: 100
        },
        checked: false
      },
      "$100 - $150": {
        priceRanges: {
          low: 100,
          high: 150
        },
        checked: false
      },
      "$150+": {
        priceRanges: {
          low: 150,
          high: null
        },
        checked: false

      }

    },
    shoeSizes: {
      ...SHOE_SIZES.reduce((a, v) => ({ ...a, [v]: false }), {})
    }
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      let API_URL = `http://localhost:8888/shoes`

      if (query.get('query')) {
        API_URL = `http://localhost:8888/shoes/query/${query.get('query')}`
      }

      const response = await axios.get(API_URL)
      const newSortedShoes: Array<Shoe> = getSortedShoes(response.data)
      setShoes(response.data)
      setSortedShoes(newSortedShoes)

      setLoading(false)
    }

    fetchFromAPI()
  }, [query.get('query')])

  useEffect(() => {
    window.scrollTo(0, 0)
    const newShoes: Array<Shoe> = getFilteredShoes(shoes)
    const newSortedShoes: Array<Shoe> = getSortedShoes(newShoes)
    setSortedShoes(newSortedShoes)
    setCurrentPage(1)
  }, [filters, sortType, query.get('query')])


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
      case 'Most Likes':
        return sortByLowestPrice(shoesToSort)
      case 'Most Reviews':
        return sortByLowestPrice(shoesToSort)
      default:
        return shoesToSort
    }
  }

  const handleNewPageClick = (newPaginatedShoes: Array<Shoe>) => {
    setPaginatedShoes(newPaginatedShoes)
  }

  return (
    <div className="text-xl-lg">
      <div className="flex">
        <Sidebar filters={filters} setFilters={setFilters} shoeSizes={SHOE_SIZES} />

        <div className="flex-10 p-4 sm:p-3">
          <SortDropdown sortType={sortType} setSortType={setSortType} />
          {loading ? <div className="flex justify-center h-screen"><CircleLoader size={16} /></div> : (
            <div>

              <div className="flex justify-center flex-wrap sm:justify-between">
                {paginatedShoes.map((shoe: Shoe) => {
                  return (
                    <SmallShoe key={shoe.shoeID} shoe={shoe} />
                  )
                })}
              </div>

              <Pagination data={sortedShoes} pageLimit={Math.ceil(sortedShoes.length / 10)} dataLimit={9} currentPage={currentPage} setCurrentPage={setCurrentPage} handleNewPageClick={handleNewPageClick} filters={filters} sortType={sortType} />
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default ProductList