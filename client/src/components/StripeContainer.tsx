import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Redirect } from "react-router"
import CheckoutForm from "../pages/CheckoutForm"
import { RootState } from "../redux/store"
import CircleLoader from "../skeleton_loaders/CircleLoader"

const REACT_APP_STRIPE = process.env.REACT_APP_STRIPE
const stripePromise = loadStripe(REACT_APP_STRIPE)

interface Props {
  children: React.ReactNode
}

const StripeContainer = ({ children }: Props) => {

  const { currentCart, total } = useSelector((state: RootState) => state.cart)
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const postToAPI = async () => {
      try {
        const response: any = await axios.post(`${process.env.REACT_APP_DEV_URL}/checkout/create-payment-intent`, {
          items: currentCart.products,
          total: total
        })
        if (response.data.error) {
          setLoading(false)
          return
        } else {
          setClientSecret(response.data.clientSecret)
        }
      } catch (err) {
        console.log(err)
      }
      setLoading(false)
    }
    postToAPI()
  }, []);

  const appearance: any = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  console.log('fcul you')
  console.log(clientSecret)

  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      <div className="App">
        {clientSecret ? (
          <Elements options={options} stripe={stripePromise}>
            {children}
          </Elements>
        ) : (
          <Redirect to="/" />
        )}
      </div>
    )
  );
}

export default StripeContainer