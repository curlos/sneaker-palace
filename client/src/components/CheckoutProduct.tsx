import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { IProduct, Shoe } from '../types/types'

interface Props {
  product: IProduct
}

const CheckoutProduct = ({ product }: Props) => {

  const [shoe, setShoe] = useState<Partial<Shoe>>()
  const [loading, setLoading] = useState(true)
  const totalCost = Number(product.quantity * product.retailPrice).toFixed(2)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes/${product.productID}`)
      setShoe(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [])

  return (

    loading ? <div>Loading...</div> : (
      <div className="flex mb-7 text-sm">
        <div>
          <img src={shoe?.image?.original} alt={shoe?.name} className="h-24 w-24" />
        </div>

        <div className="text-gray-600">
          <div className="text-black">{shoe?.name}</div>
          <div>Size: {product.size}</div>
          <div>Colorway: {shoe?.colorway}</div>
          <div>Qty: {product.quantity} @ {totalCost}</div>
          <div>{totalCost}</div>
        </div>
      </div>
    )
  )
}

export default CheckoutProduct
