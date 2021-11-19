import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import SmallOrder from '../components/SmallOrder'
import { RootState } from '../redux/store'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IOrder, UserType } from '../types/types'

const Orders = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    const fetchFromAPI = async () => {
      const response = await axios.get(`${process.env.REACT_APP_DEV_URL}/orders/user/${user._id}`)
      console.log(response.data)
      setOrders(response.data)
      setLoading(false)
    }

    fetchFromAPI()
  }, [user._id])

  console.log(orders)

  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> :
      <div className="px-36 sm:px-4">
        <div className="text-3xl py-5">Your Orders</div>
        {orders && orders.map((order: IOrder) => order.products.length > 0 && <SmallOrder order={order} />)}
      </div>
  )
}

export default Orders
