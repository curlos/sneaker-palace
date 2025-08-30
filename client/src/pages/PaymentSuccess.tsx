import { useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useCart, useUpdateGuestCartMutation, useUpdateUserCartMutation } from '../api/cartApi'
import { useCreateUserOrderMutation, useCreateGuestOrderMutation } from '../api/ordersApi'
import { RootState } from '../redux/store'
import CircleLoader from '../skeleton_loaders/CircleLoader'
import { useGetLoggedInUserQuery } from '../api/userApi'

const PaymentSuccess = () => {
  const userId = useSelector((s: RootState) => s.user.currentUser?._id);
  const { data: user } = useGetLoggedInUserQuery(userId);
  
  // Use unified cart hook
  const { data: cartData } = useCart()
  const currentCart = cartData
  const total = cartData?.total || 0
  
  // Cart mutations for clearing cart after payment
  const [updateGuestCart] = useUpdateGuestCartMutation()
  const [updateUserCart] = useUpdateUserCartMutation()
  
  // Order mutations
  const [createUserOrder] = useCreateUserOrderMutation()
  const [createGuestOrder] = useCreateGuestOrderMutation()
  
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
        if (currentCart && currentCart.products && currentCart.products.length > 0) {
          const body: any = {
            products: [...currentCart.products],
            amount: total,
            card: paymentMethod.card,
            billingDetails: paymentMethod.billing_details,
            paymentIntentID: paymentIntentID,
            orderDate: new Date().toString(),
            deliveryDate: new Date(moment().add(2, 'days').format("ddd, MMM D").toUpperCase()).toString()
          }

          if (user?._id) {
            // Only create order if there are products in cart
            if (currentCart.products.length > 0) {
              try {
                const response: any = await createUserOrder(body).unwrap()

              if (response && response.error) {
                setOrderID(response.orderID)
              } else {
                const { order } = response

                setOrderID(order._id)
                
                // Clear the user's cart after successful payment
                if (currentCart?._id) {
                  try {
                    await updateUserCart({
                      products: []
                    }).unwrap()
                  } catch (error) {
                    console.error('Failed to clear user cart after payment:', error)
                  }
                }
              }
              } catch (err) {
                console.log(err)
              }
            }
          } else {
            // Only create order if there are products in cart
            if (currentCart.products.length > 0) {
              try {
                const response: any = await createGuestOrder(body).unwrap()

              if (response && response.error) {
                setOrderID(response.orderID)
              } else {
                const { order } = response

                setOrderID(order._id)
                // Clear guest cart on successful order using RTK Query
                await updateGuestCart({ products: [], total: 0 })
              }
              } catch (err) {
                console.log(err)
              }
            }
          }

          setLoading(false)
        }
      }
      addToOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCart, paymentInfo, total, user?._id])

  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      <div className="container mx-auto px-4 py-7 max-w-6xl flex-grow">
        <div className="text-lg">
          {user ? (
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