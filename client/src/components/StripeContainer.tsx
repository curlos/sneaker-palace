import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import CheckoutForm from "../pages/CheckoutForm"
import { RootState } from "../redux/store"

const REACT_APP_STRIPE = process.env.REACT_APP_STRIPE
const stripePromise = loadStripe(REACT_APP_STRIPE)

interface Props {
  children: React.ReactNode
}

const StripeContainer = ({ children }: Props) => {

	const { currentCart, total } = useSelector((state: RootState) => state.cart)
	const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const postToAPI = async () => {
			const response: any = await axios.post("http://localhost:8888/checkout/create-payment-intent", {
				items: currentCart.products,
				total: total
			})
			setClientSecret(response.data.clientSecret)
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

  return (
    <div className="App">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          {children}
        </Elements>
      )}
    </div>
  );
}

export default StripeContainer