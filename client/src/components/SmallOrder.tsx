import moment from 'moment'
import { Link } from 'react-router-dom'
import { useGetShoeQuery } from '../api/shoesApi'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { IOrder } from '../types/types'
import SmallOrderShoe from './SmallOrderShoe'
import * as short from "short-uuid"

interface Props {
  order: IOrder
}

// Component to fetch and display a single shoe
const OrderShoe = ({ product }: { product: any }) => {
  const { data: shoe, isLoading } = useGetShoeQuery(product.productID)
  
  if (isLoading) return <CircleLoader size={10} />
  if (!shoe) return null

  
  return <SmallOrderShoe key={shoe._id} item={{ shoe, product }} />
}

const SmallOrder = ({ order }: Props) => {

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

      <div className="space-y-1">
        {order.products?.map((product) => 
          <OrderShoe key={`${product.productID}-${short.generate()}`} product={product} />
        )}
      </div>
    </div>
  )
}

export default SmallOrder