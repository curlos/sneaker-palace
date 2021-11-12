import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from "react-redux";
import { UserType, ICart, IProduct, CartState } from "../types/types";
import { RootState } from "../redux/store";
import CartProduct from '../components/CartProduct'
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm'

console.log(process.env.REACT_APP_STRIPE)

const KEY = process.env.REACT_APP_STRIPE

const Cart = () => {
  
  const dispatch = useDispatch()
  const [stripeToken, setStripeToken] = useState<string>('')
  const stripePromise = KEY && loadStripe(KEY);

  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart, total } = useSelector((state: RootState) => state.cart)

  const onToken = (token: string) => {
    setStripeToken(token)
  }

  // useEffect(() => {
  //   const checkoutCart = async () => {

  //   }
  // }, [])

  console.log(currentCart)
  console.log(total)

  return (
    <div className="w-full px-16 py-12 flex flex-start">
        <div className="flex-6">
          <div className="font-medium text-xl mb-5">Bag</div>
          {currentCart?.products?.map((product: IProduct) => <CartProduct productInfo={product}/>)}
        </div>

        <div className="flex-2 px-7">
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
          
          <div className="w-full mb-3">
            <button className="bg-black text-white w-full py-4 px-9 rounded-full hover:bg-gray-900">Checkout</button>
          </div>

          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          ) : null}
          
        
        </div>
      </div>
  )
}

export default Cart
