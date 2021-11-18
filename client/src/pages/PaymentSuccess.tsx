import { useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateCart } from '../redux/cartRedux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { UserType } from '../types/types'

const PaymentSuccess = () => {

  console.log('fuck you')

  const dispatch = useDispatch()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart, total } = useSelector((state: RootState) => state.cart)
  const [loading, setLoading] = useState(true)
  const [orderID, setOrderID] = useState<any>({})

  const stripe = useStripe();
  const [paymentInfo, setPaymentInfo] = useState<any>({})

  useEffect(() => {
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (stripe && clientSecret) {

      stripe
        .retrievePaymentIntent(clientSecret)
        .then((paymentIntent: any) => {

          if (paymentIntent && paymentIntent.paymentIntent) {
            console.log('2')
            axios.get(`${process.env.REACT_APP_DEV_URL}/checkout/payment-method/${paymentIntent.paymentIntent.payment_method}`).then((result) => {
              console.log(result)
              setPaymentInfo({ paymentMethod: result.data, paymentIntentID: paymentIntent.paymentIntent.id })
            })
          }
        });
    }
  }, [stripe])

  useEffect(() => {
    const { paymentMethod, paymentIntentID } = paymentInfo

    console.log('hello')

    if (paymentMethod && paymentIntentID && paymentMethod.card && paymentMethod.billing_details) {
      const addToOrders = async () => {
        if (currentCart && currentCart.products) {
          const body = {
            userID: user._id,
            products: [...currentCart.products],
            amount: total,
            card: paymentMethod.card,
            billingDetails: paymentMethod.billing_details,
            paymentIntentID: paymentIntentID,
            orderDate: new Date().toString(),
            deliveryDate: new Date(moment().add(2, 'days').format("ddd, MMM D").toUpperCase()).toString()
          }

          console.log(body)

          try {
            const response: any = await axios.post(`${process.env.REACT_APP_DEV_URL}/orders/`, body)

            console.log(response.data)

            if (response && response.data.error) {
              setOrderID(response.data.orderID)
            } else {
              const { order, updatedUser, updatedCart } = response.data

              setOrderID(order._id)
              dispatch(updateUser(updatedUser))
              dispatch(updateCart(updatedCart))
            }
          } catch (err) {

          }

          setLoading(false)
        }
      }
      addToOrders()
    }
  }, [currentCart, dispatch, paymentInfo, total, user._id])



  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      <div className="px-24 py-7 h-screen sm:px-4">
        <div className="text-lg">
          <div className="text-4xl">Hello {user.firstName} {user.lastName},</div>
          <div>We'll email you an order confirmation with details and tracking info.</div>

          <div className="flex gap-3 mt-3 sm:flex-col">
            <button className="bg-black p-4 text-white rounded-full">
              <Link to="/shoes" className="">Continue Shopping</Link>
            </button>
            <button className="bg-white p-4 text-black border border-black rounded-full">
              <Link to={`/order-details/${orderID}`}>View or manage order</Link>
            </button>
          </div>
        </div>
      </div>
    )
  )
}

export default PaymentSuccess