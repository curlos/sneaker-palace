import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import CheckoutProduct from '../components/CheckoutProduct'
import OrderDetails from '../components/OrderDetails'
import { RootState } from '../redux/store'
import { IProduct, Shoe, UserType } from '../types/types'

const PaymentSuccess = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart, total } = useSelector((state: RootState) => state.cart)
  const [firstProduct, setFirstProduct] = useState<Shoe>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFromAPI = async () => {
      if (currentCart && currentCart.products) {
        const response = await axios.get(`http://localhost:8888/shoes/${currentCart.products[0].productID}`)
        setFirstProduct(response.data)
        setLoading(false)
      }
    }
    fetchFromAPI()
  }, [])

  console.log(firstProduct)

  return (
    loading ? <div>Loading...</div> : (
      <div className="px-24 py-7">
        <div className="text-lg">
          <div className="text-4xl">Hello {user.firstName} {user.lastName},</div>
          <div>Thank you for shopping with us. You ordered <Link to={''} className="text-blue-400 hover:underline">"{firstProduct?.name.slice(0, 14)}..."</Link></div>
          <div>Your order number is: <span className="font-bold">13213213123</span></div>
          <div>We'll email you an order confirmation with details and tracking info.</div>

          <OrderDetails />
          
          <div className="flex gap-3 mt-3">
            <button className="bg-black p-4 text-white rounded-full">
              <Link to="/shoes" className="">Continue Shopping</Link>
            </button>
            <button className="bg-white p-4 text-black border border-black rounded-full">
              <Link to="/orders">View or manage order</Link>
            </button>
          </div>
        </div>
      </div>
    )
  )
}

export default PaymentSuccess
