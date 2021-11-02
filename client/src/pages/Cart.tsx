import React from 'react'
import CartItem from '../components/CartItem'

const Cart = () => {
  return (
    <div className="w-full px-16 py-12 flex flex-start">
      <div className="flex-6">
        <div className="font-medium text-xl mb-5">Bag</div>
        <CartItem item={''}/>
        <CartItem item={''}/>
        <CartItem item={''}/>


      </div>

      <div className="flex-2 px-7">
        <div className="font-medium text-xl mb-5">Summary</div>
        <div className="flex justify-between items-center mb-2">
          <div>Subtotal</div>
          <div>$0.00</div>
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
          <div>$0.00</div>
        </div>
        <div className="border-0 border-b border-solid border-gray-300 my-3"></div>
        
        <div className="w-full mb-3">
          <button className="bg-black text-white w-full py-4 px-9 rounded-full hover:bg-gray-900">Checkout</button>
        </div>

        <div className="w-full mb-3">
          <button className="bg-gray-200 border border-gray-300 w-full py-4 px-9 rounded-full hover:bg-gray-300">Paypal</button>
        </div>
      
      </div>
    </div>
  )
}

export default Cart
