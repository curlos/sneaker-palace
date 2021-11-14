import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import React from "react"
import PaymentForm from "../pages/PaymentForm"

interface Props {
  
}

const REACT_APP_STRIPE = process.env.REACT_APP_STRIPE
const stripeTestPromise = loadStripe(REACT_APP_STRIPE)

export const StripeContainer = () => {


	return (
		<Elements stripe={stripeTestPromise}>
			<PaymentForm />
		</Elements>
	)
}