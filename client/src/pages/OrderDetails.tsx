import axios from 'axios'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MoreShoes from '../components/MoreShoes'
import SmallOrderShoe from '../components/SmallOrderShoe'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IOrder, IProduct, UserType } from '../types/types'

const OrderDetails = () => {

  const { id }: { id: string } = useParams()
  const [order, setOrder] = useState<IOrder>()
  const [shoes, setShoes] = useState<Array<IProduct>>([])
  const [customer, setCustomer] = useState<UserType>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/orders/${id}`)

      const newShoes = await getAllShoes(response.data.products)
      setShoes(newShoes)
      setOrder(response.data)

      if (response.data.userID) {
        const userResponse = await axios.get(`${process.env.REACT_APP_DEV_URL}/users/${response.data.userID}`)
        setCustomer(userResponse.data)
      }

      setLoading(false)
    }
    fetchFromAPI()
  }, [id])


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
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      order ? (
        <div className="p-10 sm:px-3">
          <div className="text-3xl mb-3">Order Details</div>
          <span className="border-0 border-r border-gray-300 pr-3 sm:border-none">Ordered on {moment(order.orderDate).format('MMMM Do YYYY')}</span>
          <span className="px-3 sm:block sm:px-0">Order# {order._id}</span>

          <div className="py-4 flex sm:flex-col sm:gap-4">
            <div className="flex-2">
              <div className="font-bold">Shipping Address</div>
              <div>{customer ? `${customer.firstName} ${customer.lastName}` : 'Guest'}</div>
              <div>{order.billingDetails.address.postal_code}</div>
              <div>{order.billingDetails.address.country}</div>
            </div>

            <div className="flex-2">
              <div className="font-bold">Payment Method</div>
              <div>{order.card.brand.toUpperCase()} **** {order.card.last4}</div>
            </div>

            <div className="flex-2">
              <div className="font-bold">Order Summary</div>
              <div className="">
                <div className="flex justify-between">
                  <div>Item(s) Subtotal:</div>
                  <div>${order.amount}.00</div>
                </div>

                <div className="flex justify-between">
                  <div>Shipping & Handling:</div>
                  <div>${0}.00</div>
                </div>

                <div className="flex justify-between">
                  <div>Total before Tax:</div>
                  <div>${order.amount}.00</div>
                </div>

                <div className="flex justify-between">
                  <div>Estimated tax to be collected:</div>
                  <div>${0}.00</div>
                </div>

                <div className="flex justify-between">
                  <div className="font-bold">Grand Total:</div>
                  <div className="font-bold">${order.amount}.00</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 border border-gray-300 rounded-lg">
            {shoes.map((shoe) => <SmallOrderShoe key={shoe._id} shoe={shoe} />)}
          </div>

          <div className="py-10">
            <div className="text-2xl">More shoes</div>
            <MoreShoes />
          </div>

        </div>
      ) : (
        <div></div>
      )
    )

  )
}

export default OrderDetails
