import axios from 'axios'
import React, {useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Shoe } from '../types/types'

const FullShoePage = () => {

  const { shoeID }: { shoeID: string } = useParams()
  
  const [shoe, setShoe] = useState<Partial<Shoe>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFromAPI = async () => {
      console.log(shoeID)
      const response = await axios.get(`http://localhost:8888/shoes/${shoeID}`)
      setShoe(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [])

  console.log(shoe)

  return (

    <div>
      {loading ? 'Loading...' :
      (<div>
        <img src={shoe?.image?.original} alt="hello world"/>
      </div>)}
    </div>
  )
}

export default FullShoePage
