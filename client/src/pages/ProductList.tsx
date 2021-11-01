import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import SmallShoe from '../components/SmallShoe'

const ProductList = () => {

  const [shoes, setShoes] = useState([])

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
      <Navbar />
      <div className="flex">
        <Sidebar />

        <div className="flex justify-center flex-wrap flex-8 bg-gray-100">
          {shoes.map((shoe) => {
            return (
              <SmallShoe shoe={shoe} />
            )
          })}
        </div>
        
      </div>
    </div>
  )

}

export default ProductList