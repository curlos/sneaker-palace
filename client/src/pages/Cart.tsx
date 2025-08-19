import React, { useEffect } from 'react'
import { useSelector } from "react-redux"
import { Link } from 'react-router-dom'
import CartProduct from '../components/CartProduct'
import { RootState } from "../redux/store"
import { IProduct } from "../types/types"

const Cart = () => {

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { currentCart, total } = useSelector((state: RootState) => state.cart)

  return (
    <div className="w-full p-6 flex flex-start flex-grow lg:p-4 sm:block ">
      <div className="flex-6">
        <div className="font-medium text-xl mb-5">Bag</div>
        {currentCart?.products?.map((product: IProduct) => <CartProduct key={product._id} productInfo={product} />)}
      </div>

      <div className="flex-2 px-7 sm:px-0">
        <div className="font-medium text-xl mb-5">Summary</div>
        <div className="flex justify-between items-center mb-2">
          <div>Subtotal</div>
          <div>${total}.00</div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div>Estimated Shipping & Handling</div>
          <div>$0.00</div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div>Estimated Tax</div>
          <div>-</div>
        </div>

        <div className="border-0 border-b border-solid border-gray-300 my-3"></div>
        <div className="flex justify-between items-center">
          <div>Total</div>
          <div>${total}.00</div>
        </div>
        <div className="border-0 border-b border-solid border-gray-300 my-3"></div>

        <Link to={'/payment'} className="bg-black text-white my-4 w-full py-4 px-9 rounded-full hover:bg-gray-900 text-center block">Checkout</Link>


      </div>
    </div>
  )
}

export default Cart
