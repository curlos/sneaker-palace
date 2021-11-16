import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { IOrder, IProduct, UserType } from '../types/types'
import CheckoutProduct from '../components/CheckoutProduct'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { userInfo } from 'os'
import SmallOrder from '../components/SmallOrderShoe'
import SmallOrderShoe from '../components/SmallOrderShoe'
import MoreShoes from '../components/MoreShoes'
import CircleLoader from '../skeleton_loaders/CircleLoader'

const OrderDetails = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { id }: { id: string } = useParams()
  const [order, setOrder] = useState<IOrder>()
  const [shoes, setShoes] = useState<Array<IProduct>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/orders/${id}`)
      const newShoes = await getAllShoes(response.data.products)
      setShoes(newShoes)
      setOrder(response.data)
      setLoading(false)
    }
    fetchFromAPI()
  }, [])


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
              <div>{user.firstName} {user.lastName}</div>
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
            {shoes.map((shoe) => <SmallOrderShoe shoe={shoe} />)}
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
