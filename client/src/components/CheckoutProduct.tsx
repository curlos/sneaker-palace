import axios from 'axios'
import React, { useEffect, useState } from 'react'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IProduct, Shoe } from '../types/types'

interface Props {
  product: IProduct,
  type: string
}

const CheckoutProduct = ({ product, type }: Props) => {

  const [shoe, setShoe] = useState<Partial<Shoe>>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`http://localhost:8888/shoes/${product.productID}`)
      setShoe(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [product])

  return (

    loading ? <div className="flex py-10"><CircleLoader size={16} /></div> : (
      type === 'small' ? (
        <div className="flex mb-7 text-sm">
          <div>
            <img src={shoe?.image?.original} alt={shoe?.name} className="h-24 w-24" />
          </div>

          <div className="text-gray-600">
            <div className="text-black">{shoe?.name}</div>
            <div>Size: {product.size}</div>
            <div>Colorway: {shoe?.colorway}</div>
            <div>Qty: {product.quantity} @ {shoe && shoe.retailPrice && Number(product.quantity * shoe?.retailPrice).toFixed(2)}</div>
            <div>{shoe && shoe.retailPrice && Number(product.quantity * shoe?.retailPrice).toFixed(2)}</div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between mb-7 text-base">
          <div className="flex gap-5">
            <div>
              <img src={shoe?.image?.original} alt={shoe?.name} className="h-40 w-40" />
            </div>

            <div className="text-gray-600">
              <div className="text-black font-medium">{shoe?.name}</div>
              <div>Size: {product.size}</div>
              <div>Colorway: {shoe?.colorway}</div>
              <div>Quantity: {product.quantity}</div>
            </div>
          </div>

          <div className="text-lg font-medium">{shoe && shoe.retailPrice && Number(product.quantity * shoe?.retailPrice).toFixed(2)}</div>
        </div>
      )
    )
  )
}

export default CheckoutProduct