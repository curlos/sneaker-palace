import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
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

      setOrders(response.data)
      setLoading(false)
    }

    fetchFromAPI()
  }, [user._id])



  return (
    loading ? <div className="flex justify-center p-10 h-screen"><CircleLoader size={16} /></div> :
      <div className="flex-grow px-36 sm:px-4">
        <div className="text-3xl py-5">Your Orders</div>
        {orders && orders.length < 1 ? (
          <div className="text-base flex items-center gap-2">
            <div>No orders found</div>
            <button className="py-4 px-10 sm:px-2 bg-black text-white"><Link to="/shoes">Order shoes</Link></button>
          </div>
        ) : (
          orders.map((order: IOrder) => order.products.length > 0 && <SmallOrder key={order._id} order={order} />)
        )}
      </div>
  )
}

export default Orders
