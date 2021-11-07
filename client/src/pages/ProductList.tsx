import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import SmallShoe from '../components/SmallShoe'
import { Shoe } from '../types/types'

const ProductList = () => {

  const SHOE_SIZES = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '14.5', '15', '16', '17' ]

  const [shoes, setShoes] = useState([])
  const [filters, setFilters] = useState({
    colors: {
      'red': false,
      'white': false,
      'yellow': false,
      'black': false,
      'blue': false,
      'brown': false,
      'green': false,
      'gray': false,
      'pink': false,
      'purple': false,
    },
    brands: {
      'Adidas': false,
      'Air Jordan': false,
      'Alexander McQueen': false,
      "Asics": false,
      "Balenciaga": false,
      "Burberry": false,
      "Chanel": false,
      "Common Projects": false,
      "Converse": false,
      "Crocs": false,
      "Diadora": false,
      "Dior": false,
      "Gucci": false,
      "Jordan": false,
      "Li Ning": false,
      "New Balance": false,
      "Nike": false,
      "Louis Vuitton": false,
      "Off-White": false,
      "Prada": false,
      "Puma": false,
      "Reebok": false,
      "Saint Laurent": false,
      "Saucony": false,
      "Vans": false,
      "Yeezy": false,
    },
    genders: {
      "Men": false,
      "Women": false,
      "Unisex": false
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
      setShoes(response.data)
    }

    fetchFromAPI()
  }, [])

  console.log(shoes)

  return (
    <div className="text-xl-lg">
      <div className="flex">
        <Sidebar filters={filters} setFilters={setFilters}/>

        <div className="flex justify-center flex-wrap flex-10">
          {shoes.map((shoe: Shoe) => {
            return (
              <SmallShoe key={shoe.shoeID} shoe={shoe} />
            )
          })}
        </div>
        
      </div>
    </div>
  )

}

export default ProductList