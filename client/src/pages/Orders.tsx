import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import SmallOrder from '../components/SmallOrder'
import { RootState } from '../redux/store'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IOrder } from '../types/types'
import { useGetUserOrdersQuery } from '../api/ordersApi'

const Orders = () => {
  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  
  const { data: orders, isLoading: loading } = useGetUserOrdersQuery(userId, {
    skip: !userId
  });

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    loading ? <div className="flex justify-center p-10 h-screen"><CircleLoader size={16} /></div> :
      <div className="container mx-auto px-4 max-w-6xl flex-grow">
        <div className="text-3xl py-5">Your Orders</div>
        {!orders || orders.length < 1 ? (
          <div className="text-base flex items-center gap-2">
            <div>No orders found</div>
            <button className="py-4 px-10 sm:px-2 bg-black text-white"><Link to="/shoes">Order shoes</Link></button>
          </div>
        ) : (
          [...(orders || [])].sort((a: IOrder, b: IOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order: IOrder) => order.products.length > 0 && <SmallOrder key={order._id} order={order} />)
        )}
      </div>
  )
}

export default Orders
