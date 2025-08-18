import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Redirect } from "react-router"
import { RootState } from "../redux/store"
import CircleLoader from "../skeleton_loaders/CircleLoader"

// Initialize Stripe with publishable key (safe for frontend)
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
    // This is the security handshake - backend creates payment intent with secret key
    const postToAPI = async () => {
      try {
        // Send cart data to backend to create authorized payment intent
        // Backend verifies the total and creates payment intent with Stripe secret key
        const response: any = await axios.post(`${process.env.REACT_APP_DEV_URL}/checkout/create-payment-intent`, {
          items: currentCart.products,
          total: total
        })
        if (response.data.error) {
          setLoading(false)
          return
        } else {
          // Receive client secret - this authorizes frontend to show Stripe form
          // Client secret is like a "ticket" for this specific payment amount only
          setClientSecret(response.data.clientSecret)
        }
      } catch (err) {
        console.error('Failed to create payment intent:', err)
      }
      setLoading(false)
    }
    postToAPI()
  }, [currentCart.products, total]);

  // Stripe Elements configuration
  const appearance: any = {
    theme: 'stripe', // Use Stripe's default styling theme
  };
  const options = {
    clientSecret, // Required: authorizes this frontend to collect payment
    appearance,
  };

  return (
    loading ? <div className="flex justify-center h-screen p-10"><CircleLoader size={16} /></div> : (
      <div className="App">
        {clientSecret ? (
          // Only render Stripe Elements if we have a valid client secret
          // This ensures payment form only appears for authorized payments
          <Elements options={options} stripe={stripePromise}>
            {children}
          </Elements>
        ) : (
          // Redirect home if no client secret (payment intent creation failed)
          <Redirect to="/" />
        )}
      </div>
    )
  );
}

export default StripeContainer