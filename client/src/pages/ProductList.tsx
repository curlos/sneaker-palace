import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import SmallShoe from '../components/SmallShoe'
import { Shoe } from '../types/types'
import { filterByBrand, filterByColor, filterByGender, filterByPrice } from '../utils/filterShoes'
import { SortDropdown } from '../components/SortDropdown'


const ProductList = () => {

  const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17' ]

  const [shoes, setShoes] = useState([])
  const [filteredShoes, setFilteredShoes] = useState<Array<Shoe>>([])
  const [sortedShoes, setSortedShoes] = useState<Array<Shoe>>([])
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
      ...SHOE_SIZES.reduce((a, v) => ({ ...a, [v]: false}), {}) 
    }
  })

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes`)
      const filteredShoes: Array<Shoe> = getFilteredShoes(response.data)
      setShoes(response.data)
      setFilteredShoes(filteredShoes)
    }

    fetchFromAPI()
  }, [])

  useEffect(() => {
    const newShoes: Array<Shoe> = getFilteredShoes(shoes)
    setFilteredShoes(newShoes)
  }, [filters])

  const getFilteredShoes = (shoesToFilter: Array<Shoe>) => {
    const colorShoes = filterByBrand(filters, shoesToFilter)
    const brandShoes = filterByColor(filters, colorShoes)
    const genderShoes = filterByGender(filters, brandShoes)
    const priceShoes = filterByPrice(filters, genderShoes)

    return priceShoes
  }

  console.log(filterByPrice(filters, shoes))

  return (
    <div className="text-xl-lg">
      <div className="flex">
        <Sidebar filters={filters} setFilters={setFilters} shoeSizes={SHOE_SIZES}/>

        <div className="flex-10">
          <SortDropdown sortType={sortType} setSortType={setSortType}/>

          <div className="flex justify-center flex-wrap">
            {filteredShoes.map((shoe: Shoe) => {
              return (
                <SmallShoe key={shoe.shoeID} shoe={shoe} />
              )
            })}
          </div>
        </div>
        
      </div>
    </div>
  )

}

export default ProductList