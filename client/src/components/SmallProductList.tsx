import axios from 'axios'
import React, { useEffect, useState } from 'react'

interface Props {
  searchText: string
}

const SmallProductList = ({ searchText }: Props) => {

  const [shoes, setShoes] = useState([])

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes/query/${searchText}`)
      console.log(response.data)
      setShoes(response.data)
    }
    fetchFromAPI()
  }, [searchText])

  const handleOnChange = () => {

  }

  console.log(shoes)


  return (
    <div>
      
    </div>
  )
}

export default SmallProductList
