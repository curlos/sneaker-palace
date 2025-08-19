import { useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { resetCart, updateCart } from '../redux/cartRedux'
import { RootState } from '../redux/store'
import { updateUser } from '../redux/userRedux'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { UserType } from '../types/types'

const PaymentSuccess = () => {
  const dispatch = useDispatch()
  const user: Partial<UserType> = useSelector((state: RootState) => state.user && state.user.currentUser)
  const { currentCart, total } = useSelector((state: RootState) => state.cart)
  const [loading, setLoading] = useState(true)
  const [orderID, setOrderID] = useState<any>({})

  const stripe = useStripe();
  const [paymentInfo, setPaymentInfo] = useState<any>({})

  useEffect(() => {
    window.scrollTo(0, 0)
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (stripe && clientSecret) {
      stripe
        .retrievePaymentIntent(clientSecret)
        .then((paymentIntent: any) => {

          if (paymentIntent && paymentIntent.paymentIntent) {
            axios.get(`${process.env.REACT_APP_DEV_URL}/checkout/payment-method/${paymentIntent.paymentIntent.payment_method}`).then((result) => {
              setPaymentInfo({ paymentMethod: result.data, paymentIntentID: paymentIntent.paymentIntent.id })
            })
          }
        });
    }
  }, [stripe])

  useEffect(() => {
    const { paymentMethod, paymentIntentID } = paymentInfo

    if (paymentMethod && paymentIntentID && paymentMethod.card && paymentMethod.billing_details) {
      const addToOrders = async () => {
        if (currentCart && currentCart.products) {
          const body: any = {
            products: [...currentCart.products],
            amount: total,
            card: paymentMethod.card,
            billingDetails: paymentMethod.billing_details,
            paymentIntentID: paymentIntentID,
            orderDate: new Date().toString(),
            deliveryDate: new Date(moment().add(2, 'days').format("ddd, MMM D").toUpperCase()).toString()
          }

          if (Object.keys(user).length >= 1) {
            body.userID = user._id

            try {
              const response: any = await axios.post(`${process.env.REACT_APP_DEV_URL}/orders/`, body)

              if (response && response.data.error) {
                setOrderID(response.data.orderID)
              } else {
                const { order, updatedUser, updatedCart } = response.data

                setOrderID(order._id)
                dispatch(updateUser(updatedUser))
                dispatch(updateCart(updatedCart))
              }
            } catch (err) {
              console.log(err)
            }
          } else {
            try {
              const response: any = await axios.post(`${process.env.REACT_APP_DEV_URL}/orders/no-account`, body)

              if (response && response.data.error) {
                setOrderID(response.data.orderID)
              } else {
                const { order } = response.data

                setOrderID(order._id)
                dispatch(resetCart())
                localStorage.removeItem('currentCart')
              }
            } catch (err) {
              console.log(err)
            }
          }

          setLoading(false)
        }
      }
      addToOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCart, dispatch, paymentInfo, total, user._id])

  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      <div className="container mx-auto px-4 py-7 max-w-6xl flex-grow">
        <div className="text-lg">
          {Object.keys(user).length > 0 ? (
            <div className="text-4xl">Hello {user.firstName} {user.lastName},</div>
          ) : (
            <div className="text-4xl">Hello user,</div>
          )}
          <div>We'll email you an order confirmation with details and tracking info.</div>

          <div className="flex gap-3 mt-3 sm:flex-col">
            <Link to="/shoes" className="">
              <button className="bg-black p-4 text-white rounded-full">
                Continue Shopping
              </button>
            </Link>
            <Link to={`/order-details/${orderID}`}>
              <button className="bg-white p-4 text-black border border-black rounded-full">
                View or manage order
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  )
}

export default PaymentSuccess