import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import CheckoutProduct from './CheckoutProduct'

const OrderDetails = () => {

  const { currentCart, total } = useSelector((state: RootState) => state.cart)

  return (
    <div>
      <div className="border-0 border-b border-t border-solid border-gray-300 p-5 flex gap-8">
        <div className="">
          <div className="mb-4">
            <div className="text-gray-500">Order date</div>
            <div className="font-bold">November 14, 2021</div>
          </div>

          <div>
            <div className="text-gray-500">Order number</div>
            <div className="font-bold">13213213123</div>
          </div>
        </div>

        <div className="">
          <div className="mb-4">
            <div className="text-gray-500">Estimated delivery</div>
            <div className="font-bold">November 16, 2021</div>
          </div>

          <div>
            <div className="text-gray-500">Payment method</div>
            <div className="font-bold">**** 4321</div>
          </div>
        </div>
      </div>

      <div className="py-4">
        {currentCart.products?.map((product) => <CheckoutProduct product={product} type="large"/>)}
      </div>

      <div className="border-0 border-t border-solid border-gray-300 py-5">
        <div className="flex justify-between">
          <div className="text-gray-500">Subtotal</div>
          <div>${total}.00</div>
        </div>

        <div className="flex justify-between">
          <div className="text-gray-500">Shipping</div>
          <div>${0}.00</div>
        </div>

        <div className="flex justify-between">
          <div className="text-gray-500">Estimated tax</div>
          <div>${0}.00</div>
        </div>

        <div className="flex justify-between">
          <div className="text-gray-500">Total</div>
          <div>${total}.00</div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
