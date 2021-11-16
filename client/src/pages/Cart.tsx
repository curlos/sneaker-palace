import React, { useState, useEffect } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { UserType, ICart, IProduct, CartState } from "../types/types";
import { RootState } from "../redux/store";
import CartProduct from '../components/CartProduct'
import axios from 'axios';

const KEY = process.env.REACT_APP_STRIPE

const Cart = () => {

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart, total } = useSelector((state: RootState) => state.cart)

  return (
    <div className="w-full px-16 py-12 flex flex-start min-h-screen sm:p-4 sm:block">
      <div className="flex-6">
        <div className="font-medium text-xl mb-5">Bag</div>
        {currentCart?.products?.map((product: IProduct) => <CartProduct productInfo={product} />)}
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

        <div className="bg-black text-white my-4 w-full py-4 px-9 rounded-full hover:bg-gray-900 text-center">
          <Link to={'/payment'}>Checkout</Link>
        </div>


      </div>
    </div>
  )
}

export default Cart
