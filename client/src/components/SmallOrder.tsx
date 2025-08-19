import axios from 'axios'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IOrder, IProduct, Shoe } from '../types/types'
import SmallOrderShoe from './SmallOrderShoe'
import * as short from "short-uuid"

interface Props {
  order: IOrder
}

const SmallOrder = ({ order }: Props) => {

  const [shoes, setShoes] = useState<Array<Shoe>>()

  useEffect(() => {
    const fetchFromAPI = async () => {
      const newShoes = await getAllShoes(order.products)
      setShoes(newShoes)
    }
    fetchFromAPI()
  }, [order.products])

  const getAllShoes = async (products: Array<IProduct>) => {
    const newShoes = []
    for (let product of products) {
      const { productID } = product
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/shoes/${productID}`)
      newShoes.push(response.data)
    }
    return newShoes
  }

  return (
    <div className="border border-gray-300 rounded-lg my-4 p-5 text-gray-800">
      <div className="flex justify-between mb-4 text-sm sm:flex-col sm:gap-3 gap-2">
        <div className="flex gap-10">
          <div>
            <div className="font-bold">ORDER PLACED</div>
            <div>{moment(order.orderDate).format('MMMM Do YYYY')}</div>
          </div>

          <div>
            <div className="font-bold">TOTAL</div>
            <div>${order.amount}.00</div>
          </div>
        </div>

        <div>
          <div className="font-bold">ORDER #{order._id}</div>
          <Link to={`/order-details/${order._id}`} className="text-blue-400 hover:underline">View order details</Link>
        </div>
      </div>

      {shoes?.map((shoe) => <SmallOrderShoe key={`${shoe._id}-${short.generate()}`} shoe={shoe} />)}
    </div>
  )
}

export default SmallOrder